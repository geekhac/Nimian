import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { Product, ProductFilters, PaginationState } from '@/store/useProductStore';

export interface GetProductsParams {
  page?: number;
  page_size?: number;
  search?: string;
  brand_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ProductAPI {
  static async getProducts(params: GetProductsParams): Promise<ProductsResponse> {
    const { 
      page = 1, 
      page_size = 12, 
      search, 
      brand_id, 
      sort_by = 'created_at',
      sort_order = 'desc' 
    } = params;

    const supabase = await createSupabaseServerClient();

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          brands:brand_id (brand_name),
          supply_records (
            id,
            supplier_id,
            product_id,
            price,
            min_quantity,
            max_quantity,
            is_active,
            suppliers:supplier_id (supplier_name)
          )
        `, { count: 'exact' });

      // 搜索过滤 - 优化品牌搜索
      if (search) {
        // 先搜索品牌ID
        const { data: brandMatches } = await supabase
          .from('brands')
          .select('id')
          .ilike('brand_name', `%${search}%`);

        const brandIds = brandMatches?.map((b: { id: string }) => b.id) || [];
        
        // 构建搜索条件
        const searchConditions = [`product_name.ilike.%${search}%`];
        if (brandIds.length > 0) {
          searchConditions.push(`brand_id.in.(${brandIds.join(',')})`);
        }
        
        query = query.or(searchConditions.join(','));
      }

      // 品牌过滤
      if (brand_id) {
        query = query.eq('brand_id', brand_id);
      }

      // 排序
      query = query.order(sort_by, { ascending: sort_order === 'asc' });

      // 分页
      const offset = (page - 1) * page_size;
      query = query.range(offset, offset + page_size - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Product API Error:', error);
        throw new Error(`获取商品数据失败: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / page_size);

      return {
        products: data || [],
        total,
        page,
        pageSize: page_size,
        totalPages,
      };
    } catch (error) {
      console.error('Product API Error:', error);
      throw error;
    }
  }

  static async getBrands(): Promise<Array<{ id: string; brand_name: string }>> {
    const supabase = await createSupabaseServerClient();
    
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, brand_name')
        .order('brand_name');

      if (error) {
        console.error('Brands API Error:', error);
        throw new Error(`获取品牌数据失败: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Brands API Error:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete Product Error:', error);
        throw new Error(`删除商品失败: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete Product Error:', error);
      throw error;
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'brands' | 'supply_records'>): Promise<Product> {
    const supabase = await createSupabaseServerClient();
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select(`
          *,
          brands:brand_id (brand_name),
          supply_records (
            id,
            supplier_id,
            product_id,
            price,
            min_quantity,
            max_quantity,
            is_active,
            suppliers:supplier_id (supplier_name)
          )
        `)
        .single();

      if (error) {
        console.error('Create Product Error:', error);
        throw new Error(`创建商品失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create Product Error:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const supabase = await createSupabaseServerClient();
    
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          brands:brand_id (brand_name),
          supply_records (
            id,
            supplier_id,
            product_id,
            price,
            min_quantity,
            max_quantity,
            is_active,
            suppliers:supplier_id (supplier_name)
          )
        `)
        .single();

      if (error) {
        console.error('Update Product Error:', error);
        throw new Error(`更新商品失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Update Product Error:', error);
      throw error;
    }
  }
}
