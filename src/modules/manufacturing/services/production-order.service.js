import { supabase } from "@/lib/supabase";
import { createInventoryMovement } from "@/modules/inventory/services/inventory.service";

// =====================================================
// GET BOMS
// =====================================================

export async function getBOMOptions() {
  const { data, error } = await supabase
    .from("manufacturing_boms")
    .select(
      `
        id,
        name,
        product:products (
          id,
          name
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

// =====================================================
// GET BOM DETAIL
// =====================================================

export async function getBOMDetail(id) {
  const { data, error } = await supabase
    .from("manufacturing_boms")
    .select(
      `
        *,
        product:products (
          id,
          name,
          unit
        ),
        items:manufacturing_bom_items (
          id,
          qty,
          material:products (
            id,
            name,
            unit
          )
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// =====================================================
// CREATE PRODUCTION ORDER
// =====================================================

export async function createProductionOrder({ bom, productionQty, materials, note }) {
  // =========================================
  // CREATE HEADER
  // =========================================

  const { data: order, error } = await supabase
    .from("manufacturing_orders")
    .insert([
      {
        order_no: `MO-${Date.now()}`,

        bom_id: bom.id,

        product_id: bom.product.id,

        production_qty: productionQty,

        note,

        status: "DRAFT",
      },
    ])
    .select()
    .single();

  if (error) {
    return { error };
  }

  // =========================================
  // CREATE ITEMS
  // =========================================

  const items = materials.map((item) => ({
    manufacturing_order_id: order.id,

    material_id: item.material.id,

    required_qty: item.required_qty,

    actual_qty: item.required_qty,
  }));

  const { error: itemError } = await supabase.from("manufacturing_order_items").insert(items);

  return {
    data: order,
    error: itemError,
  };
}

// =====================================================
// GET PRODUCTION ORDERS
// =====================================================

export async function getProductionOrders() {
  const { data, error } = await supabase
    .from("manufacturing_orders")
    .select(
      `
        *,
        product:products (
          id,
          name,
          unit
        ),
        bom:manufacturing_boms (
          id,
          name
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data || [];
}

// =====================================================
// GET PRODUCTION ORDER DETAIL
// =====================================================

export async function getProductionOrderById(id) {
  const { data, error } = await supabase
    .from("manufacturing_orders")
    .select(
      `
        *,
        product:products (
          id,
          name,
          unit
        ),
        bom:manufacturing_boms (
          id,
          name
        ),
        items:manufacturing_order_items (
          id,
          material_id,
          required_qty,
          actual_qty,
          material:products (
            id,
            name,
            unit
          )
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    return { error };
  }

  return { data };
}

// =====================================================
// EXECUTE PRODUCTION
// =====================================================

export async function executeProduction(order) {
  try {
    if (order.status !== "DRAFT") {
      return {
        error: {
          message: "Production already processed",
        },
      };
    }

    // =========================================
    // MATERIAL OUT
    // =========================================

    for (const item of order.items) {
      // =========================================
      // GET PRODUCT
      // =========================================

      const { data: material } = await supabase.from("products").select("*").eq("id", item.material_id).single();

      // =========================================
      // VALIDATION
      // =========================================

      if (Number(material.stock || 0) < Number(item.required_qty)) {
        return {
          error: {
            message: `Insufficient stock for ${item.material?.name}`,
          },
        };
      }

      // =========================================
      // NEW STOCK
      // =========================================

      const newStock = Number(material.stock || 0) - Number(item.required_qty);

      // =========================================
      // UPDATE STOCK
      // =========================================

      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock: newStock,
        })
        .eq("id", item.material_id);

      if (stockError) {
        return {
          error: stockError,
        };
      }

      // =========================================
      // INVENTORY MOVEMENT
      // =========================================

      const unitCost = Number(material.average_cost || 0);

      const totalCost = unitCost * Number(item.required_qty);

      const { error: movementError } = await supabase.from("inventory_movements").insert([
        {
          product_id: item.material_id,

          type: "OUT",

          qty: Number(item.required_qty),

          unit_cost: unitCost,

          total_cost: totalCost,

          note: `Production ${order.order_no}`,
        },
      ]);

      if (movementError) {
        return {
          error: movementError,
        };
      }
    }

    // =========================================
    // UPDATE STATUS
    // =========================================

    const { error: statusError } = await supabase
      .from("manufacturing_orders")
      .update({
        status: "QC",
      })
      .eq("id", order.id);

    if (statusError) {
      return {
        error: statusError,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      error: err,
    };
  }
}

// =====================================================
// EXECUTE PRODUCTION
// =====================================================

export async function receiveProduction({ order, finalQty, totalYield, shrinkageQty = 0, processCost = 0 }) {
  try {
    // =========================================
    // MATERIAL COST
    // =========================================

    let materialCost = 0;

    for (const item of order.items) {
      const qty = Number(item.actual_qty || item.required_qty);

      const unitCost = Number(item.material?.average_cost || 0);

      materialCost += qty * unitCost;
    }

    // =========================================
    // TOTAL COST
    // =========================================

    const totalCost = materialCost + Number(processCost);

    const costPerUnit = finalQty <= 0 ? 0 : totalCost / finalQty;

    const totalProgress = Number(totalYield || 0) + Number(order.shrinkage_qty || 0) + Number(shrinkageQty || 0);
    // =========================================
    // GET FINISHED PRODUCT
    // =========================================

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        `
        id,
        stock,
        average_cost
      `,
      )
      .eq("id", order.product_id)
      .single();

    if (productError) {
      return {
        error: productError,
      };
    }

    // =========================================
    // MOVING AVERAGE FG
    // =========================================

    const currentStock = Number(product.stock || 0);

    const currentAverage = Number(product.average_cost || 0);

    const newStock = currentStock + Number(finalQty);

    const newAverage = newStock <= 0 ? costPerUnit : (currentStock * currentAverage + finalQty * costPerUnit) / newStock;

    // =========================================
    // UPDATE FG PRODUCT
    // =========================================

    const { error: updateError } = await supabase
      .from("products")
      .update({
        stock: newStock,

        average_cost: Number(newAverage.toFixed(2)),
      })
      .eq("id", order.product_id);

    if (updateError) {
      return {
        error: updateError,
      };
    }

    // =========================================
    // INVENTORY MOVEMENT
    // =========================================

    const movementResult = await createInventoryMovement({
      productId: order.product_id,

      type: "IN",

      qty: Number(finalQty),

      unitCost: Number(costPerUnit.toFixed(2)),

      totalCost: Number(totalCost.toFixed(2)),

      note: `Production ${order.order_no}`,
    });

    if (movementResult.error) {
      return {
        error: movementResult.error,
      };
    }

    // =========================================
    // UPDATE ORDER
    // =========================================

    const { error: orderError } = await supabase
      .from("manufacturing_orders")
      .update({
        status: totalProgress >= Number(order.production_qty) ? "DONE" : "PARTIAL",

        yield_qty: Number(totalYield),

        shrinkage_qty: Number(order.shrinkage_qty || 0) + Number(shrinkageQty || 0),

        process_cost: Number(order.process_cost || 0) + Number(processCost || 0),

        material_cost: Number(materialCost.toFixed(2)),

        total_cost: Number(order.total_cost || 0) + Number(totalCost.toFixed(2)),

        cost_per_unit: Number(costPerUnit.toFixed(2)),
      })
      .eq("id", order.id);

    if (orderError) {
      return {
        error: orderError,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      error: err,
    };
  }
}
