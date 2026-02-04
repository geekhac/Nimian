import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Product {
  id: string;
  product_name: string;
  specification: string | null;
  description: string | null;
  brand_id: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  brands?: { brand_name?: string } | Array<{ brand_name?: string }>;
  supply_records?: Array<{
    id: string;
    supplier_id: string;
    product_id: string;
    price: number;
    min_quantity: number;
    max_quantity?: number;
    is_active: boolean;
    suppliers?: { supplier_name: string };
  }>;
}

export interface ProductFilters {
  search?: string;
  brand_id?: string;
  page?: number;
  page_size?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ProductState {
  products: Product[];
  brands: Array<{ id: string; brand_name: string }>;
  filters: ProductFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setBrands: (brands: Array<{ id: string; brand_name: string }>) => void;
  updateFilters: (filters: Partial<ProductFilters>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({
      products: [],
      brands: [],
      filters: {
        page: 1,
        page_size: 12,
      },
      pagination: {
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 0,
      },
      loading: false,
      error: null,
      
      setProducts: (products) => set({ products }),
      
      setBrands: (brands) => set({ brands }),
      
      updateFilters: (filters) => set((state) => {
        const newFilters = { ...state.filters, ...filters };
        // 如果搜索或品牌改变，重置到第一页
        if (filters.search !== undefined || filters.brand_id !== undefined) {
          newFilters.page = 1;
        }
        return { filters: newFilters };
      }),
      
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      resetFilters: () => set({
        filters: {
          page: 1,
          page_size: 12,
        },
        pagination: {
          page: 1,
          pageSize: 12,
          total: 0,
          totalPages: 0,
        }
      }),
    }),
    {
      name: 'product-store',
    }
  )
);
