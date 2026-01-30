'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { SupplierFormData } from '@/types/supplier'

// 获取供应商列表（服务端）
export async function getSuppliers(filters?: {
    search?: string;
    region?: string;
    category?: string;
    rating?: string;
}) {
     try {
    const supabase = await createSupabaseServerClient()

    let query = supabase
        .from('supplier_assessment')
        .select('*')
        .order('created_at', { ascending: false })

    // 应用筛选条件
    if (filters?.search) {
        query = query.or(`supplier_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,contact_phone.ilike.%${filters.search}%`)
    }
    
    if (filters?.region && filters.region !== 'all') {
        query = query.eq('region', filters.region)
    }
    
    if (filters?.category && filters.category !== 'all') {
        query = query.contains('product_categories', [filters.category])
    }
    
    if (filters?.rating && filters.rating !== 'all') {
        const ratingNum = parseInt(filters.rating)
        query = query.gte('rating', ratingNum)
    }

    const { data, error } = await query
    if (error) throw error
    
    revalidatePath('/suppliers')
    return data
    } catch (error) {
    // 打印详细的错误信息到服务器控制台
    console.error('【/suppliers页面数据获取失败】', error);
    // 可以返回一个空数组或null，防止页面崩溃
    return [];
  }
}

// 获取单个供应商
export async function getSupplier(id: string) {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
        .from('supplier_assessment')
        .select('*')
        .eq('id', id)
        .single()
    
    if (error) throw error
    return data
}

// 创建供应商
export async function createSupplier(formData: SupplierFormData) {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
        .from('supplier_assessment')
        .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }])
        .select()
        .single()
    
    if (error) throw error
    
    revalidatePath('/suppliers')
    return data
}

// 更新供应商
export async function updateSupplier(id: string, formData: Partial<SupplierFormData>) {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
        .from('supplier_assessment')
        .update({
            ...formData,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
    
    if (error) throw error
    
    revalidatePath('/suppliers')
    return data
}

// 删除供应商
export async function deleteSupplier(id: string) {
    const supabase = await createSupabaseServerClient()
    
    const { error } = await supabase
        .from('supplier_assessment')
        .delete()
        .eq('id', id)
    
    if (error) throw error
    
    revalidatePath('/suppliers')
    return { success: true }
}

// 获取地区列表
export async function getRegions() {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
        .from('supplier_assessment')
        .select('region')
        .not('region', 'is', null)
    
    if (error) throw error
    
    const regions = [...new Set(data.map(item => item.region).filter(Boolean))]
    return regions as string[]
}

// 获取品类列表
export async function getCategories() {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
        .from('supplier_assessment')
        .select('product_categories')
        .not('product_categories', 'is', null)
    
    if (error) throw error
    
    const categories = new Set<string>()
    data.forEach(item => {
        if (item.product_categories) {
            item.product_categories.forEach(cat => categories.add(cat))
        }
    })
    
    return Array.from(categories)
}

// 获取统计数据
export async function getSupplierStats() {
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
        .from('supplier_assessment')
        .select('rating, annual_purchase_amount')
    
    if (error) throw error
    
    const stats = {
        total: data.length,
        averageRating: data.length > 0 
            ? data.reduce((acc, s) => acc + (s.rating || 0), 0) / data.length 
            : 0,
        totalPurchaseAmount: data.reduce((acc, s) => acc + (s.annual_purchase_amount || 0), 0)
    }
    
    return stats
}