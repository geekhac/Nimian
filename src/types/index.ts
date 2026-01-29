export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface Product {
  id: string;
  product_name: string;
  specification: string | null;
  description: string | null;
  brand_id: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  brand_name: string;
  registered_location: string | null;
  core_category_focus: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductWithRelations extends Product {
  brands: Brand;
  inventory?: {
    stock_quantity: number;
  };
  suppliers?: {
    count: number;
  };
}