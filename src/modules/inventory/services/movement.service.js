import { supabase } from "@/lib/supabase";

// =====================================================
// GET ALL MOVEMENTS
// =====================================================

export async function getMovements() {
  const { data, error } = await supabase.from("inventory_movements_view").select("*").order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return data || [];
}

// =====================================================
// GET PRODUCT MOVEMENTS
// =====================================================

export async function getProductMovements(productId) {
  const { data, error } = await supabase.from("inventory_movements_view").select("*").eq("product_id", productId).order("created_at", {
    ascending: false,
  });

  return {
    data: data || [],
    error,
  };
}
