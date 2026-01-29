import ProductCard from '@/components/products/ProductCard';
import Pagination from '../shared/Pagination';

interface ProductListProps {
  products: Array<{
    id: string;
    product_name: string;
    specification: string | null;
    description: string | null;
    brand_id: string;
    brands: {
      brand_name: string;
    };
  }>;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[]>;
}

export default function ProductList({ 
  products, 
  currentPage, 
  totalPages,
  searchParams 
}: ProductListProps)  {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 商品网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 分页组件 */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={searchParams}
          />
        </div>
      )}
    </div>
  );
}