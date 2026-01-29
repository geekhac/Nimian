import { Filter, X } from 'lucide-react';
import FilterLink from '@/components/products/FilterLink';


interface ProductFiltersProps {
  brands: Array<{ id: string; brand_name: string }>;
  currentBrand?: string;
  searchParams: Record<string, string | string[]>;
}


export default function ProductFilters({ 
  brands, 
  currentBrand,
  searchParams 
}: ProductFiltersProps) {
  const activeFilters = Object.keys(searchParams).filter(
    key => key !== 'page' && searchParams[key]
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h2>
        {activeFilters.length > 0 && (
          <FilterLink 
            href="/products"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </FilterLink>
        )}
      </div>

      {/* 品牌筛选 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Brand</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <FilterLink 
            href="/products"
            className={`flex items-center gap-2 cursor-pointer text-sm ${
              !currentBrand ? 'text-blue-600 font-medium' : 'text-gray-600'
            }`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
              !currentBrand ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}>
              {!currentBrand && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            All Brands
          </FilterLink>
          
          {brands.map((brand) => (
            <FilterLink
              key={brand.id}
              href={`/products?brand_id=${brand.id}`}
              className={`flex items-center gap-2 cursor-pointer text-sm ${
                currentBrand === brand.id ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                currentBrand === brand.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
              }`}>
                {currentBrand === brand.id && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {brand.brand_name}
            </FilterLink>
          ))}
        </div>
      </div>

      {/* 类别筛选 */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          {['Skincare', 'Makeup', 'Haircare', 'Oral Care', 'Body Care'].map((category) => (
            <FilterLink
              key={category}
              href={`/products?category=${category.toLowerCase()}`}
              className={`block text-sm ${
                searchParams.category === category.toLowerCase() 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {category}
            </FilterLink>
          ))}
        </div>
      </div>

      {/* 活跃的筛选标签 */}
      {activeFilters.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(searchParams)
              .filter(([key, value]) => value && key !== 'page')
              .map(([key, value]) => {
                let displayValue = value;
                let displayKey = key.replace('_', ' ');
                
                if (key === 'brand_id') {
                  const brand = brands.find(b => b.id === value);
                  displayValue = brand?.brand_name || value;
                  displayKey = 'Brand';
                }
                
                return (
                  <FilterLink
                    key={key}
                    href={`/products?${new URLSearchParams({
                      ...searchParams,
                      [key]: ''
                    }).toString()}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {displayKey}: {displayValue}
                    <X className="w-3 h-3 ml-1" />
                  </FilterLink>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}