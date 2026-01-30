import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import MerchantTable from "@/components/merchants/MerchantTable";
import { Merchant } from "@/types/merchant";

export default async function MerchantsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: merchants, error } = await supabase
    .from("merchants")
    .select("*")
    .order("joined_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            加载失败: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <MerchantTable initialMerchants={merchants as Merchant[]} />
      </div>
    </div>
  );
}
