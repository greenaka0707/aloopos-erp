import { supabase } from "@/lib/supabase";

export async function createInventoryMovement({ productId, type, qty, note = "", unitCost = null, totalCost = null }) {
  // =====================================================
  // VALIDATION
  // =====================================================

  if (Number(qty) <= 0) {
    return {
      error: {
        message: "Qty must be greater than zero",
      },
    };
  }

  // =====================================================
  // GET PRODUCT
  // =====================================================

  const { data: product, error: productError } = await supabase.from("products").select("*").eq("id", productId).single();

  if (productError) {
    return {
      error: productError,
    };
  }

  // =====================================================
  // CURRENT VALUES
  // =====================================================

  const currentStock = Number(product.stock || 0);

  const currentAverageCost = Number(product.average_cost || 0);

  // =====================================================
  // SNAPSHOT COST AT MOVEMENT TIME
  // =====================================================

  const movementUnitCost = unitCost ?? currentAverageCost;

  const movementQty = Number(qty);

  const movementTotalCost = totalCost ?? movementUnitCost * movementQty;

  // =====================================================
  // CALCULATE NEW STOCK
  // =====================================================

  let newStock = currentStock;

  if (type === "IN") {
    newStock += movementQty;
  }

  if (type === "OUT") {
    newStock -= movementQty;

    if (newStock < 0) {
      return {
        error: {
          message: "Insufficient stock",
        },
      };
    }
  }

  // =====================================================
  // CALCULATE MOVING AVERAGE COST
  // =====================================================

  let newAverageCost = currentAverageCost;

  if (type === "IN") {
    const totalOldValue = currentStock * currentAverageCost;

    const totalIncomingValue = movementQty * movementUnitCost;

    const totalQty = currentStock + movementQty;

    if (totalQty > 0) {
      newAverageCost = Math.round(((totalOldValue + totalIncomingValue) / totalQty) * 100) / 100;
    }
  }

  // =====================================================
  // INSERT INVENTORY MOVEMENT
  // =====================================================

  const { error: movementError } = await supabase.from("inventory_movements").insert([
    {
      product_id: productId,

      type,

      qty: movementQty,

      unit_cost: movementUnitCost,

      total_cost: movementTotalCost,

      average_cost_snapshot: currentAverageCost,

      note,
    },
  ]);

  if (movementError) {
    return {
      error: movementError,
    };
  }

  // =====================================================
  // UPDATE PRODUCT
  // =====================================================

  const updatePayload = {
    stock: newStock,
  };

  // =====================================================
  // UPDATE COSTING ONLY FOR IN
  // =====================================================

  if (type === "IN") {
    updatePayload.average_cost = newAverageCost;

    updatePayload.last_cost = movementUnitCost;
  }

  const { error: stockError } = await supabase.from("products").update(updatePayload).eq("id", productId);

  if (stockError) {
    return {
      error: stockError,
    };
  }

  // =====================================================
  // SUCCESS
  // =====================================================

  return {
    success: true,
  };
}
