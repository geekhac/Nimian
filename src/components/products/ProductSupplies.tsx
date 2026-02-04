"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

interface Supplier {
  id: number;
  supplier_name: string;
  supplier_link?: string | null;
}

interface PriceTier {
  min_qty: number;
  max_qty: number | null;
  price: number;
}

interface SupplyRecord {
  id: string;
  product_id: string;
  supplier_id: number;
  supplier: Supplier;
  price: number;
  moq: number;
  price_tiers: PriceTier[] | null;
  has_authorization: boolean;
  has_certification: boolean;
  is_active: boolean;
  delivery_days: number;
  valid_from: string;
  valid_until: string | null;
  notes: string | null;
  purchase_link: string | null;
  created_at: string;
}

interface ProductSuppliesProps {
  productId: string;
}

export default function ProductSupplies({ productId }: ProductSuppliesProps) {
  const [supplies, setSupplies] = useState<SupplyRecord[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SupplyRecord | null>(null);
  const [formData, setFormData] = useState({
    supplier_id: "",
    price: "",
    moq: "1",
    has_authorization: false,
    has_certification: false,
    is_active: true,
    delivery_days: "3",
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "",
    notes: "",
    purchase_link: "",
    price_tiers: [] as PriceTier[],
  });

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadSupplies();
    loadSuppliers();
  }, [productId]);

  const loadSupplies = async () => {
    try {
      const { data } = await supabase
        .from("supply_records")
        .select(
          `
          *,
          supplier:supplier_id (
            id,
            supplier_name,
            supplier_link
          )
        `,
        )
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (data) {
        setSupplies(data as SupplyRecord[]);
      }
    } catch (error) {
      console.error("加载供应信息失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const { data } = await supabase
        .from("supplier_assessment")
        .select("id, supplier_name, supplier_link")
        .order("supplier_name");

      if (data) {
        setSuppliers(data as Supplier[]);
      }
    } catch (error) {
      console.error("加载供应商失败:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        product_id: productId,
        supplier_id: parseInt(formData.supplier_id),
        price: parseFloat(formData.price),
        moq: parseInt(formData.moq),
        has_authorization: formData.has_authorization,
        has_certification: formData.has_certification,
        is_active: formData.is_active,
        delivery_days: parseInt(formData.delivery_days),
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        notes: formData.notes || null,
        purchase_link: formData.purchase_link || null,
        price_tiers:
          formData.price_tiers.length > 0 ? formData.price_tiers : null,
      };

      if (editingRecord) {
        const { error } = await supabase
          .from("supply_records")
          .update(submitData)
          .eq("id", editingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("supply_records")
          .insert(submitData);

        if (error) throw error;
      }

      // 重置表单
      setFormData({
        supplier_id: "",
        price: "",
        moq: "1",
        has_authorization: false,
        has_certification: false,
        is_active: true,
        delivery_days: "3",
        valid_from: new Date().toISOString().split("T")[0],
        valid_until: "",
        notes: "",
        purchase_link: "",
        price_tiers: [],
      });
      setShowForm(false);
      setEditingRecord(null);
      loadSupplies();
    } catch (error) {
      console.error("保存供应信息失败:", error);
      alert("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: SupplyRecord) => {
    setEditingRecord(record);
    setFormData({
      supplier_id: record.supplier_id.toString(),
      price: record.price.toString(),
      moq: record.moq.toString(),
      has_authorization: record.has_authorization,
      has_certification: record.has_certification,
      is_active: record.is_active,
      delivery_days: record.delivery_days.toString(),
      valid_from: record.valid_from,
      valid_until: record.valid_until || "",
      notes: record.notes || "",
      purchase_link: record.purchase_link || "",
      price_tiers: record.price_tiers || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条供应信息吗？")) return;

    try {
      const { error } = await supabase
        .from("supply_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
      loadSupplies();
    } catch (error) {
      console.error("删除供应信息失败:", error);
      alert("删除失败，请重试");
    }
  };

  const addPriceTier = () => {
    setFormData((prev) => ({
      ...prev,
      price_tiers: [
        ...prev.price_tiers,
        { min_qty: 0, max_qty: null, price: 0 },
      ],
    }));
  };

  const updatePriceTier = (
    index: number,
    field: keyof PriceTier,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      price_tiers: prev.price_tiers.map((tier, i) =>
        i === index
          ? {
              ...tier,
              [field]:
                field === "price"
                  ? parseFloat(value) || 0
                  : parseInt(value) || 0,
            }
          : tier,
      ),
    }));
  };

  const removePriceTier = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      price_tiers: prev.price_tiers.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">供应信息</h3>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer hover:pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加供应商
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium mb-4 text-gray-900">
            {editingRecord ? "编辑供应信息" : "添加供应信息"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  供应商 *
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplier_id: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="">选择供应商</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  价格 (元) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最小起订量
                </label>
                <input
                  type="number"
                  value={formData.moq}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, moq: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  交货天数
                </label>
                <input
                  type="number"
                  value={formData.delivery_days}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      delivery_days: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生效日期
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      valid_from: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  失效日期
                </label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      valid_until: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                购买链接
              </label>
              <input
                type="url"
                value={formData.purchase_link}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    purchase_link: e.target.value,
                  }))
                }
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                备注
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.has_authorization}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      has_authorization: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">有授权</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.has_certification}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      has_certification: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">有认证</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">有效</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                  setFormData({
                    supplier_id: "",
                    price: "",
                    moq: "1",
                    has_authorization: false,
                    has_certification: false,
                    is_active: true,
                    delivery_days: "3",
                    valid_from: new Date().toISOString().split("T")[0],
                    valid_until: "",
                    notes: "",
                    purchase_link: "",
                    price_tiers: [],
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:pointer disabled:opacity-50"
              >
                {loading ? "保存中..." : editingRecord ? "更新" : "添加"}
              </button>
            </div>
          </form>
        </div>
      )}

      {supplies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          暂无供应信息，点击上方按钮添加
        </div>
      ) : (
        <div className="space-y-4">
          {supplies.map((record) => (
            <div
              key={record.id}
              className={`border rounded-lg p-4 ${!record.is_active ? "bg-gray-50 border-gray-200" : "border-gray-300"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {record.supplier.supplier_name}
                    </h4>
                    {record.supplier.supplier_link && (
                      <a
                        href={record.supplier.supplier_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                        title="访问供应商官网"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {!record.is_active && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        无效
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">价格:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        ¥{record.price}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">起订量:</span>
                      <span className="ml-2 text-gray-900">{record.moq}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">交货:</span>
                      <span className="ml-2 text-gray-900">
                        {record.delivery_days}天
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">有效期:</span>
                      <span className="ml-2 text-gray-900">
                        {record.valid_from} 至 {record.valid_until || "长期"}
                      </span>
                    </div>
                  </div>

                  {record.purchase_link && (
                    <div className="mt-2">
                      <a
                        href={record.purchase_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        购买链接 →
                      </a>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      备注: {record.notes}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs">
                    {record.has_authorization && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        有授权
                      </span>
                    )}
                    {record.has_certification && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        有认证
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(record)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
