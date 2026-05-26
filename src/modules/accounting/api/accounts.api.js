import { supabase } from "@/lib/supabase";

export async function getAccountMappings() {
  return await supabase.from("account_mappings").select(`
      *,
      accounts (
        id,
        code,
        name,
        category
      )
    `);
}
