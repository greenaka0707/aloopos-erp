import { supabase } from "@/lib/supabase";

import { createInventoryMovement } from "@/modules/inventory/services/inventory.service";

import { createSalesJournal } from "@/modules/accounting/services/sales-journal.service";

import { removeJournalByReference } from "@/modules/accounting/services/journal.service";

// ============================================
// CREATE SALES ORDER
// ============================================

export async function createSalesOrder({
  orderDate,
  customerName,
  salesName,
  paidAmount,
  isDraft,
  items,
}) {
  try {
    // ============================================
    // VALIDATE
    // ============================================

    if (!customerName) {
      return {
        error: {
          message: "Customer wajib diisi",
        },
      };
    }

    if (!items || items.length === 0) {
      return {
        error: {
          message: "Item kosong",
        },
      };
    }

    // ============================================
    // VALIDATE STOCK
    // ============================================

    let grandTotalHpp = 0;

    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .single();

      if (error || !product) {
        return {
          error: {
            message: "Product not found",
          },
        };
      }

      if (
        !isDraft &&
        Number(product.stock || 0) < Number(item.qty)
      ) {
        return {
          error: {
            message: `Stock ${product.name} tidak cukup`,
          },
        };
      }
    }

    // ============================================
    // TOTAL
    // ============================================

    const totalAmount = items.reduce((sum, item) => {
      return (
        sum +
        Number(item.qty || 0) *
          Number(item.price || 0)
      );
    }, 0);

    const paid = Number(paidAmount || 0);

    const isPaid = paid >= totalAmount;

    // ============================================
    // GENERATE NUMBER
    // ============================================

    const soNumber = "SO-" + Date.now();

    // ============================================
    // CREATE ORDER
    // ============================================

    const { data: salesOrder, error: soError } =
      await supabase
        .from("sales_orders")
        .insert([
          {
            so_number: soNumber,

            customer_name: customerName,

            sales_name: salesName,

            order_date: orderDate,

            paid_amount: paid,

            remaining_amount: Math.max(
              totalAmount - paid,
              0,
            ),

            total_amount: totalAmount,

            payment_status: isPaid
              ? "PAID"
              : paid > 0
                ? "PARTIAL"
                : "UNPAID",

            is_paid: isPaid,

            is_draft: isDraft,

            status: isDraft
              ? "DRAFT"
              : "PENDING",
          },
        ])
        .select()
        .single();

    if (soError) {
      console.error(soError);

      return {
        error: soError,
      };
    }

    // ============================================
    // CREATE ITEMS
    // ============================================

    for (const item of items) {
      const subtotal =
        Number(item.qty) * Number(item.price);

      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .single();

      const hpp = Number(
        product.average_cost || 0,
      );

      const totalHpp =
        hpp * Number(item.qty);

      grandTotalHpp += totalHpp;

      const { error: itemError } =
        await supabase
          .from("sales_order_items")
          .insert([
            {
              sales_order_id: salesOrder.id,

              product_id: item.product_id,

              qty: Number(item.qty),

              price: Number(item.price),

              subtotal,

              hpp,

              total_hpp: totalHpp,
            },
          ]);

      if (itemError) {
        console.error(itemError);

        return {
          error: itemError,
        };
      }

      // ============================================
      // INVENTORY MOVEMENT
      // ============================================

      if (!isDraft) {
        const movementResult =
          await createInventoryMovement({
            productId: item.product_id,

            type: "OUT",

            qty: Number(item.qty),

            unitCost: hpp,

            totalCost: totalHpp,

            note: `Sales Order ${soNumber}`,
          });

        if (movementResult.error) {
          return {
            error: movementResult.error,
          };
        }
      }
    }

    // ============================================
    // ACCOUNTING JOURNAL
    // ============================================

    if (!isDraft) {
      await createSalesJournal({
        sale: {
          id: salesOrder.id,

          date: orderDate,

          invoice_number: soNumber,

          grand_total: totalAmount,

          payment_type: isPaid
            ? "CASH"
            : "CREDIT",
        },

        hpp: grandTotalHpp,
      });
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error(err);

    return {
      error: {
        message:
          err.message ||
          "Internal server error",
      },
    };
  }
}

// ============================================
// UPDATE SALES ORDER
// ============================================

export async function updateSalesOrder(
  id,
  payload,
) {
  try {
    const {
      orderDate,
      customerName,
      salesName,
      paidAmount,
      isDraft,
      items,
    } = payload;

    // ============================================
    // VALIDATE
    // ============================================

    if (!customerName) {
      return {
        error: {
          message: "Customer wajib diisi",
        },
      };
    }

    if (!items || items.length === 0) {
      return {
        error: {
          message: "Item kosong",
        },
      };
    }

    // ============================================
    // GET EXISTING ORDER
    // ============================================

    const {
      data: existingOrder,
      error: orderError,
    } = await supabase
      .from("sales_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError || !existingOrder) {
      return {
        error: {
          message:
            "Sales order not found",
        },
      };
    }

    // ============================================
    // VALIDATE STOCK
    // ============================================

    for (const item of items) {
      const { data: product, error } =
        await supabase
          .from("products")
          .select("*")
          .eq("id", item.product_id)
          .single();

      if (error || !product) {
        return {
          error: {
            message: "Product not found",
          },
        };
      }

      const { data: oldItem } =
        await supabase
          .from("sales_order_items")
          .select("*")
          .eq("sales_order_id", id)
          .eq("product_id", item.product_id)
          .single();

      const reversedStock =
        Number(product.stock || 0) +
        Number(oldItem?.qty || 0);

      if (
        !isDraft &&
        reversedStock < Number(item.qty)
      ) {
        return {
          error: {
            message: `Stock ${product.name} tidak cukup`,
          },
        };
      }
    }

    // ============================================
    // TOTAL
    // ============================================

    const totalAmount = items.reduce(
      (sum, item) => {
        return (
          sum +
          Number(item.qty || 0) *
            Number(item.price || 0)
        );
      },
      0,
    );

    const paid = Number(paidAmount || 0);

    const isPaid = paid >= totalAmount;

    // ============================================
    // UPDATE ORDER
    // ============================================

    const { error: updateError } =
      await supabase
        .from("sales_orders")
        .update({
          customer_name: customerName,

          sales_name: salesName,

          order_date: orderDate,

          paid_amount: paid,

          remaining_amount: Math.max(
            totalAmount - paid,
            0,
          ),

          total_amount: totalAmount,

          payment_status: isPaid
            ? "PAID"
            : paid > 0
              ? "PARTIAL"
              : "UNPAID",

          is_paid: isPaid,

          is_draft: isDraft,
        })
        .eq("id", id);

    if (updateError) {
      return {
        error: updateError,
      };
    }

    // ============================================
    // REMOVE OLD JOURNAL
    // ============================================

    await removeJournalByReference(
      existingOrder.so_number,
    );

    // ============================================
    // REVERSE OLD STOCK
    // ============================================

    if (!existingOrder.is_draft) {
      const { data: oldItems } =
        await supabase
          .from("sales_order_items")
          .select("*")
          .eq("sales_order_id", id);

      for (const oldItem of oldItems || []) {
        await createInventoryMovement({
          productId: oldItem.product_id,

          type: "IN",

          qty: Number(oldItem.qty),

          unitCost: oldItem.hpp || 0,

          totalCost:
            oldItem.total_hpp || 0,

          note: `Reverse Edit Sales ${existingOrder.so_number}`,
        });
      }
    }

    // ============================================
    // DELETE OLD ITEMS
    // ============================================

    const { error: deleteError } =
      await supabase
        .from("sales_order_items")
        .delete()
        .eq("sales_order_id", id);

    if (deleteError) {
      return {
        error: deleteError,
      };
    }

    // ============================================
    // INSERT NEW ITEMS
    // ============================================

    let grandTotalHpp = 0;

    for (const item of items) {
      const subtotal =
        Number(item.qty) * Number(item.price);

      const { data: product } =
        await supabase
          .from("products")
          .select("*")
          .eq("id", item.product_id)
          .single();

      const hpp = Number(
        product.average_cost || 0,
      );

      const totalHpp =
        hpp * Number(item.qty);

      grandTotalHpp += totalHpp;

      const { error: itemError } =
        await supabase
          .from("sales_order_items")
          .insert([
            {
              sales_order_id: id,

              product_id: item.product_id,

              qty: Number(item.qty),

              price: Number(item.price),

              subtotal,

              hpp,

              total_hpp: totalHpp,
            },
          ]);

      if (itemError) {
        return {
          error: itemError,
        };
      }

      // ============================================
      // INVENTORY MOVEMENT
      // ============================================

      if (!isDraft) {
        const movementResult =
          await createInventoryMovement({
            productId: item.product_id,

            type: "OUT",

            qty: Number(item.qty),

            unitCost: hpp,

            totalCost: totalHpp,

            note: `Edit Sales ${existingOrder.so_number}`,
          });

        if (movementResult.error) {
          return {
            error: movementResult.error,
          };
        }
      }
    }

    // ============================================
    // CREATE NEW JOURNAL
    // ============================================

    if (!isDraft) {
      await createSalesJournal({
        sale: {
          id,

          date: orderDate,

          invoice_number:
            existingOrder.so_number,

          grand_total: totalAmount,

          payment_type: isPaid
            ? "CASH"
            : "CREDIT",
        },

        hpp: grandTotalHpp,
      });
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error(err);

    return {
      error: {
        message:
          err.message ||
          "Internal server error",
      },
    };
  }
}

// ============================================
// GET SALES ORDERS
// ============================================

export async function getSalesOrders() {
  const { data, error } = await supabase
    .from("sales_orders")
    .select(`
      *,
      items:sales_order_items (
        id,
        product_id,
        qty,
        price,
        subtotal,
        hpp,
        total_hpp
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);

    return [];
  }

  return data;
}

// ============================================
// GET SALES ORDER BY ID
// ============================================

export async function getSalesOrderById(id) {
  const { data, error } = await supabase
    .from("sales_orders")
    .select(`
      *,
      items:sales_order_items (
        *,
        product:products (
          id,
          name,
          unit
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);

    return null;
  }

  return data;
}

// ============================================
// VOID SALES ORDER
// ============================================

export async function voidSalesOrder(order) {
  try {
    if (order.status === "VOID") {
      return {
        error: {
          message:
            "Order already void",
        },
      };
    }

    // ============================================
    // RETURN STOCK
    // ============================================

    for (const item of order.items) {
      const result =
        await createInventoryMovement({
          productId: item.product_id,

          type: "IN",

          qty: Number(item.qty),

          unitCost: item.hpp || 0,

          totalCost:
            item.total_hpp || 0,

          note: `Void Sales ${order.so_number}`,
        });

      if (result.error) {
        return {
          error: result.error,
        };
      }
    }

    // ============================================
    // REMOVE JOURNAL
    // ============================================

    await removeJournalByReference(
      order.so_number,
    );

    // ============================================
    // UPDATE STATUS
    // ============================================

    const { error } = await supabase
      .from("sales_orders")
      .update({
        status: "VOID",
      })
      .eq("id", order.id);

    if (error) {
      return {
        error,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    console.error(err);

    return {
      error: err,
    };
  }
}

// ============================================
// UPDATE SALES STATUS
// ============================================

export async function updateSalesStatus(
  orderId,
  status,
) {
  const { error } = await supabase
    .from("sales_orders")
    .update({
      status,
    })
    .eq("id", orderId);

  if (error) {
    return {
      error,
    };
  }

  return {
    success: true,
  };
}

// ========================================
// CUSTOMERS
// ========================================

export async function getCustomers() {
  const { data, error } =
    await supabase
      .from("customers")
      .select("*")
      .order("name");

  if (error) throw error;

  return data;
}

// ========================================
// PRODUCTS
// ========================================

export async function getProducts() {
  const { data, error } =
    await supabase
      .from("products")
      .select("*")
      .order("name");

  if (error) throw error;

  return data;
}

// ========================================
// SALESMANS
// ========================================

export async function getSalesmans() {
  const { data, error } =
    await supabase
      .from("salesmans")
      .select("*")
      .order("name");

  if (error) throw error;

  return data;
}