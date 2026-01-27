import SupplierTable from '@/components/SupplierTable'
import SupplierStats from '@/components/SupplierStats'
import SearchFilter from '@/components/SearchFilter'
import { createClient } from '@/lib/supabase/server-client'
import { Suspense } from 'react'

// 获取供应商数据（带筛选功能）
async function getSuppliers(searchParams) {
    const supabase = await createClient()

    let query = supabase
        .from('supplier_assessment')
        .select('*')

    // ✅ 先 await 解析 searchParams
    const params = await searchParams

    // 按供应商名称搜索
    if (params?.search) {
        query = query.ilike('supplier_name', `%${params.search}%`)
    }

    // 按地区筛选
    if (params?.region && params.region !== 'all') {
        query = query.eq('region', params.region)
    }

    // 按产品品类筛选
    if (params?.category && params.category !== 'all') {
        query = query.contains('product_categories', [params.category])
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('获取供应商数据失败:', error)
        return []
    }

    return data
}

// 获取所有地区选项（用于筛选下拉框）
async function getRegions() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('supplier_assessment')
        .select('region')
        .not('region', 'is', null)

    if (!data) return []

    const regions = [...new Set(data.map(item => item.region))].filter(Boolean)
    return regions
}

// 主页面组件
export default async function SuppliersPage({ searchParams }) {
    // ✅ 先 await 解析 searchParams
    const params = await searchParams

    // 并行获取数据
    const [suppliers, regions] = await Promise.all([
        getSuppliers(searchParams),
        getRegions()
    ])

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">供应商评估管理</h1>
                    <p className="text-gray-600 mt-2">共 {suppliers.length} 家供应商</p>
                </div>

                {/* 统计卡片 */}
                <Suspense fallback={<div className="text-center py-8">加载统计数据...</div>}>
                    <SupplierStats suppliers={suppliers} />
                </Suspense>

                {/* 搜索筛选组件（客户端组件） */}
                {/* ✅ 传递解析后的 params 而不是 searchParams */}
                <SearchFilter
                    regions={regions}
                    initialSearchParams={params}
                />

                {/* 供应商表格 */}
                <Suspense fallback={<div className="text-center py-10">加载供应商数据...</div>}>
                    <SupplierTable suppliers={suppliers} />
                </Suspense>
            </div>
        </div>
    )
}