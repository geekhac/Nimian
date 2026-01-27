// src/app/suppliers/loading.js
export default function SuppliersLoading() {
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* 骨架屏标题 */}
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>

                {/* 骨架屏统计卡片 */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-5">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 骨架屏筛选栏 */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                            <div className="h-10 bg-gray-100 rounded"></div>
                        </div>
                        <div className="min-w-[180px]">
                            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                            <div className="h-10 bg-gray-100 rounded"></div>
                        </div>
                        <div className="min-w-[180px]">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                            <div className="h-10 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded w-20"></div>
                        <div className="h-10 bg-gray-100 rounded w-20"></div>
                    </div>
                </div>

                {/* 骨架屏表格 */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6">
                        {[1, 2, 3, 4].map((row) => (
                            <div key={row} className="flex items-center border-b border-gray-200 py-4">
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                                    <div className="space-y-1">
                                        <div className="h-3 bg-gray-100 rounded w-32"></div>
                                        <div className="h-3 bg-gray-100 rounded w-24"></div>
                                        <div className="h-3 bg-gray-100 rounded w-28"></div>
                                    </div>
                                </div>
                                <div className="w-48">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="w-48">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="w-32">
                                    <div className="h-8 bg-gray-100 rounded w-24"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}