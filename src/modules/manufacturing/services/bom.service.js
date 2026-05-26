import { supabase } from "@/lib/supabase";

// =====================================================
// GET BOMS
// =====================================================

export async function getBOMs() {
  const { data, error } = await supabase
    .from("manufacturing_boms")
    .select(
      `
      *,
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
// CREATE BOM
// =====================================================

export async function createBOM({ name, productId, note, materials }) {
  // =========================================
  // CREATE HEADER
  // =========================================

  const { data: bom, error: bomError } = await supabase
    .from("manufacturing_boms")
    .insert([
      {
        code: `BOM-${Date.now()}`,
        name,
        product_id: productId,
        note,
      },
    ])
    .select()
    .single();

  if (bomError) {
    return {
      error: bomError,
    };
  }

  // =========================================
  // CREATE ITEMS
  // =========================================

  const items = materials.map((item) => ({
    bom_id: bom.id,
    material_id: item.material_id,
    qty: Number(item.qty),
  }));

  const { error: itemError } = await supabase.from("manufacturing_bom_items").insert(items);

  if (itemError) {
    return {
      error: itemError,
    };
  }

  return {
    data: bom,
    error: null,
  };
}

// =====================================================
// GET BOM BY ID
// =====================================================

export async function getBOMById(id) {
  const { data, error } = await supabase
    .from("manufacturing_boms")
    .select(
      `
      *,
      product:products (
        id,
        name
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

  return {
    data,
    error,
  };
}

// =====================================================
// DELETE BOM
// =====================================================

export async function deleteBOM(id) {
  const { error } = await supabase.from("manufacturing_boms").delete().eq("id", id);

  return { error };
}

// =====================================================
// CLONE BOM
// =====================================================

export async function cloneBOM(id) {
  // =========================================
  // GET ORIGINAL
  // =========================================

  const original = await getBOMById(id);

  if (original.error) {
    return {
      error: original.error,
    };
  }

  const bom = original.data;

  // =========================================
  // CREATE NEW HEADER
  // =========================================

  const { data: newBom, error } = await supabase
    .from("manufacturing_boms")
    .insert([
      {
        code: `BOM-${Date.now()}`,
        name: `${bom.name} Copy`,
        product_id: bom.product_id,
        note: bom.note,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error };
  }

  // =========================================
  // CLONE ITEMS
  // =========================================

  const items = bom.items.map((item) => ({
    bom_id: newBom.id,
    material_id: item.material.id,
    qty: item.qty,
  }));

  const { error: itemError } = await supabase.from("manufacturing_bom_items").insert(items);

  return {
    data: newBom,
    error: itemError,
  };
}
