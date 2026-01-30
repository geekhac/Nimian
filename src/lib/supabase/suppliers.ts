import { supabase } from './client';
import { Supplier, SupplierFormData } from '@/types/supplier';

export const supplierService = {
    // 获取所有供应商
    async getSuppliers(filters?: {
        search?: string;
        region?: string;
        category?: string;
        rating?: string;
    }) {
        let query = supabase
            .from('supplier_assessment')
            .select('*')
            .order('created_at', { ascending: false });

        // 应用筛选条件
        if (filters?.search) {
            query = query.or(`supplier_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,contact_phone.ilike.%${filters.search}%`);
        }
        
        if (filters?.region && filters.region !== 'all') {
            query = query.eq('region', filters.region);
        }
        
        if (filters?.category && filters.category !== 'all') {
            query = query.contains('product_categories', [filters.category]);
        }
        
        if (filters?.rating && filters.rating !== 'all') {
            const ratingNum = parseInt(filters.rating);
            query = query.gte('rating', ratingNum);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Supplier[];
    },

    // 获取单个供应商
    async getSupplier(id: string) {
        const { data, error } = await supabase
            .from('supplier_assessment')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data as Supplier;
    },

    // 创建供应商
    async createSupplier(supplierData: SupplierFormData) {
        const { data, error } = await supabase
            .from('supplier_assessment')
            .insert([{
                ...supplierData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) throw error;
        return data as Supplier;
    },

    // 更新供应商
    async updateSupplier(id: string, supplierData: Partial<SupplierFormData>) {
        const { data, error } = await supabase
            .from('supplier_assessment')
            .update({
                ...supplierData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data as Supplier;
    },

    // 删除供应商
    async deleteSupplier(id: string) {
        const { error } = await supabase
            .from('supplier_assessment')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    },

    // 获取地区列表
    async getRegions() {
        const { data, error } = await supabase
            .from('supplier_assessment')
            .select('region')
            .not('region', 'is', null);
        
        if (error) throw error;
        
        const regions = [...new Set(data.map(item => item.region).filter(Boolean))];
        return regions as string[];
    },

    // 获取品类列表
    async getCategories() {
        const { data, error } = await supabase
            .from('supplier_assessment')
            .select('product_categories')
            .not('product_categories', 'is', null);
        
        if (error) throw error;
        
        const categories = new Set<string>();
        data.forEach(item => {
            if (item.product_categories) {
                item.product_categories.forEach(cat => categories.add(cat));
            }
        });
        
        return Array.from(categories);
    },

    // 获取统计数据
    async getStats() {
        const { data, error } = await supabase
            .from('supplier_assessment')
            .select('rating, annual_purchase_amount');
        
        if (error) throw error;
        
        const stats = {
            total: data.length,
            averageRating: data.reduce((acc, s) => acc + (s.rating || 0), 0) / data.length,
            totalPurchaseAmount: data.reduce((acc, s) => acc + (s.annual_purchase_amount || 0), 0)
        };
        
        return stats;
    }
};