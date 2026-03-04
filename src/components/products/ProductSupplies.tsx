"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, ExternalLink, X } from "lucide-react";
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
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: "",
    price: "",
    moq: "1",
    has_authorization: false,
    has_certification: false,
    is_active: true,
    delivery_days: "3",
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: "",
    purchase_link: "",
    price_tiers: [] as PriceTier[],
  });

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadSupplies();
    loadSuppliers();
  }, [productId]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".supplier-dropdown-container")) {
        setShowSupplierDropdown(false);
      }
    };

    if (showSupplierDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSupplierDropdown]);

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

  // 过滤供应商
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.supplier_name
      .toLowerCase()
      .includes(supplierSearchTerm.toLowerCase()),
  );

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
        valid_until: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        notes: "",
        purchase_link: "",
        price_tiers: [],
      });
      setShowForm(false);
      setEditingRecord(null);
      loadSupplies();

      // 刷新服务器组件数据，更新商品列表页的价格显示
      router.refresh();

      // 显示成功提示
      if (window.toast) {
        const message = editingRecord ? "供应商信息更新成功" : "供应商添加成功";
        window.toast.success(message);
      }
    } catch (error) {
      console.error("保存供应信息失败:", error);
      if (window.toast) {
        window.toast.error("保存失败，请重试");
      } else {
        alert("保存失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: SupplyRecord) => {
    console.log("编辑供应记录:", record);
    setEditingRecord(record);

    // 设置表单数据
    const supplier = suppliers.find((s) => s.id === record.supplier_id);
    setFormData({
      supplier_id: record.supplier_id,
      price: record.price.toString(),
      moq: record.moq?.toString() || "1",
      has_authorization: record.has_authorization || false,
      has_certification: record.has_certification || false,
      is_active: record.is_active !== false,
      delivery_days: record.delivery_days?.toString() || "3",
      valid_from: record.valid_from || new Date().toISOString().split("T")[0],
      valid_until:
        record.valid_until ||
        new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      notes: record.notes || "",
      purchase_link: record.purchase_link || "",
      price_tiers: record.price_tiers || [],
    });

    // 设置供应商搜索词
    setSupplierSearchTerm(supplier?.supplier_name || "");
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

      // 刷新服务器组件数据，更新商品列表页的价格显示
      router.refresh();

      // 显示删除成功提示
      if (window.toast) {
        window.toast.success("供应信息删除成功");
      }
    } catch (error) {
      console.error("删除供应信息失败:", error);
      if (window.toast) {
        window.toast.error("删除失败，请重试");
      } else {
        alert("删除失败，请重试");
      }
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
    console.log("removePriceTier 被调用，索引:", index);
    console.log(
      "删除前 price_tiers:",
      JSON.stringify(formData.price_tiers, null, 2),
    );

    const newTiers = formData.price_tiers.filter((_, i) => i !== index);

    console.log("删除后 price_tiers:", JSON.stringify(newTiers, null, 2));

    setFormData((prev) => ({
      ...prev,
      price_tiers: newTiers,
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
          onClick={() => {
            console.log("添加供应商按钮被点击");
            // 清除编辑状态，重置表单
            setEditingRecord(null);
            setSupplierSearchTerm(""); // 重置搜索词
            setFormData({
              supplier_id: "",
              price: "",
              moq: "1",
              has_authorization: false,
              has_certification: false,
              is_active: true,
              delivery_days: "3",
              valid_from: new Date().toISOString().split("T")[0],
              valid_until: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              notes: "",
              purchase_link: "",
              price_tiers: [],
            });
            setShowForm(true);
          }}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer hover:pointer"
          style={{ cursor: "pointer" }}
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
                <div className="relative supplier-dropdown-container">
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        formData.supplier_id
                          ? suppliers.find((s) => s.id === formData.supplier_id)
                              ?.supplier_name || ""
                          : supplierSearchTerm
                      }
                      onChange={(e) => {
                        setSupplierSearchTerm(e.target.value);
                        setShowSupplierDropdown(true);
                        // 如果清空了输入，也清空选择
                        if (e.target.value === "") {
                          setFormData((prev) => ({
                            ...prev,
                            supplier_id: "",
                          }));
                        }
                      }}
                      onFocus={() => setShowSupplierDropdown(true)}
                      placeholder="搜索或选择供应商..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setSupplierSearchTerm("");
                        setFormData((prev) => ({
                          ...prev,
                          supplier_id: "",
                        }));
                        setShowSupplierDropdown(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {showSupplierDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredSuppliers.length === 0 ? (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          未找到匹配的供应商
                        </div>
                      ) : (
                        filteredSuppliers.map((supplier) => (
                          <button
                            key={supplier.id}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 text-gray-900 text-sm"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                supplier_id: supplier.id,
                              }));
                              setSupplierSearchTerm(supplier.supplier_name);
                              setShowSupplierDropdown(false);
                            }}
                          >
                            {supplier.supplier_name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
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

              {/* 阶梯价格编辑 */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    阶梯价格
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        price_tiers: [
                          ...prev.price_tiers,
                          {
                            min_qty:
                              prev.price_tiers.length > 0
                                ? Math.max(
                                    ...prev.price_tiers.map(
                                      (t) => t.max_qty || t.min_qty,
                                    ),
                                  ) + 1
                                : 1,
                            max_qty: null,
                            price: 0,
                          },
                        ],
                      }));
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:pointer"
                    style={{ cursor: "pointer" }}
                  >
                    + 添加阶梯
                  </button>
                </div>

                {formData.price_tiers.length > 0 ? (
                  <div className="space-y-2 border border-gray-200 rounded-md p-3 bg-gray-50">
                    {formData.price_tiers.map((tier, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="最小数量"
                            value={tier.min_qty}
                            onChange={(e) => {
                              const newTiers = [...formData.price_tiers];
                              const inputValue = e.target.value;
                              // 允许用户输入空值，只在失去焦点时才转换为数字
                              if (inputValue === "") {
                                newTiers[index].min_qty = "";
                              } else {
                                const parsedValue = parseFloat(inputValue);
                                newTiers[index].min_qty = isNaN(parsedValue)
                                  ? ""
                                  : parsedValue;
                              }
                              setFormData((prev) => ({
                                ...prev,
                                price_tiers: newTiers,
                              }));
                            }}
                            onBlur={(e) => {
                              const newTiers = [...formData.price_tiers];
                              const inputValue = e.target.value;
                              // 失去焦点时，将空值设为 0
                              if (inputValue === "") {
                                newTiers[index].min_qty = 0;
                                setFormData((prev) => ({
                                  ...prev,
                                  price_tiers: newTiers,
                                }));
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="text-sm text-gray-500">-</div>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="最大数量(不填=无穷大)"
                            value={tier.max_qty || ""}
                            onChange={(e) => {
                              const newTiers = [...formData.price_tiers];
                              const inputValue = e.target.value;
                              // 允许用户输入空值，只在失去焦点时才转换为数字
                              if (inputValue === "") {
                                newTiers[index].max_qty = "";
                              } else {
                                const parsedValue = parseFloat(inputValue);
                                newTiers[index].max_qty = isNaN(parsedValue)
                                  ? ""
                                  : parsedValue;
                              }
                              setFormData((prev) => ({
                                ...prev,
                                price_tiers: newTiers,
                              }));
                            }}
                            onBlur={(e) => {
                              const newTiers = [...formData.price_tiers];
                              const inputValue = e.target.value;
                              // 失去焦点时，将空值设为 null（表示无穷大）
                              if (inputValue === "") {
                                newTiers[index].max_qty = null;
                                setFormData((prev) => ({
                                  ...prev,
                                  price_tiers: newTiers,
                                }));
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="text-sm text-gray-500">件:</div>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="价格"
                            value={tier.price}
                            onChange={(e) => {
                              const newTiers = [...formData.price_tiers];
                              const inputValue = e.target.value;
                              // 允许用户输入空值，只在失去焦点时才转换为数字
                              if (inputValue === "") {
                                newTiers[index].price = "";
                              } else {
                                const parsedValue = parseFloat(inputValue);
                                newTiers[index].price = isNaN(parsedValue)
                                  ? ""
                                  : parsedValue;
                              }
                              setFormData((prev) => ({
                                ...prev,
                                price_tiers: newTiers,
                              }));
                            }}
                            onBlur={(e) => {
                              const newTiers = [...formData.price_tiers];
                              const inputValue = e.target.value;
                              // 失去焦点时，将空值设为 0
                              if (inputValue === "") {
                                newTiers[index].price = 0;
                                setFormData((prev) => ({
                                  ...prev,
                                  price_tiers: newTiers,
                                }));
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="text-sm text-gray-500">元</div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log("删除阶梯价格开始");
                            console.log(
                              "删除前阶梯数量:",
                              formData.price_tiers.length,
                            );
                            console.log("删除索引:", index);
                            console.log(
                              "当前阶梯:",
                              JSON.stringify(tier, null, 2),
                            );

                            // 确保索引有效
                            if (
                              index >= 0 &&
                              index < formData.price_tiers.length
                            ) {
                              removePriceTier(index);
                              console.log("删除操作完成");
                            } else {
                              console.error("删除索引无效:", index);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:pointer"
                          style={{ cursor: "pointer" }}
                          title="删除此阶梯价格"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500 mt-2">
                      提示：最大数量不填表示无穷大（及以上）
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 border border-gray-200 rounded-md p-3 bg-gray-50">
                    未设置阶梯价格，将使用单一价格
                  </div>
                )}
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
                    valid_until: new Date(
                      Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
                    )
                      .toISOString()
                      .split("T")[0],
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
                      <div className="ml-2">
                        {record.price_tiers &&
                        Array.isArray(record.price_tiers) &&
                        record.price_tiers.length > 0 ? (
                          // 显示阶梯价
                          <div className="font-medium text-green-600">
                            ¥
                            {Math.min(
                              ...record.price_tiers.map((t) => t.price),
                            )}
                            {record.price_tiers.length > 1 && (
                              <span className="text-gray-500 font-normal">
                                -¥
                                {Math.max(
                                  ...record.price_tiers.map((t) => t.price),
                                )}
                              </span>
                            )}
                            <span className="text-gray-400 text-xs ml-1">
                              ({record.price_tiers.length}阶梯)
                            </span>
                          </div>
                        ) : (
                          // 显示单一价格
                          <span className="font-medium text-gray-900">
                            ¥{record.price}
                          </span>
                        )}
                      </div>
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

                  {record.price_tiers &&
                    Array.isArray(record.price_tiers) &&
                    record.price_tiers.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <div className="font-medium text-gray-700 mb-2">
                          阶梯价格详情:
                        </div>
                        <div className="space-y-1">
                          {record.price_tiers.map((tier, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="text-gray-600">
                                {tier.min_qty}
                                {tier.max_qty ? `-${tier.max_qty}` : "+"} 件:
                              </span>
                              <span className="font-medium text-green-600">
                                ¥{tier.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
