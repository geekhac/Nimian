// src/components/SearchFilter.js
'use client'

import { useRouter } from 'next/navigation'

export default function SearchFilter({ regions, initialSearchParams }) {
    const router = useRouter()

    const handleReset = () => {
        router.push('/suppliers')
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <form className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        搜索供应商
                    </label>
                    <input
                        type="text"
                        name="search"
                        // ✅ 使用 initialSearchParams（已解析）
                        defaultValue={initialSearchParams?.search || ''}
                        placeholder="输入供应商名称..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="min-w-[180px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        地区筛选
                    </label>
                    <select
                        name="region"
                        // ✅ 使用 initialSearchParams（已解析）
                        defaultValue={initialSearchParams?.region || 'all'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">全部地区</option>
                        {regions.map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>

                <div className="min-w-[180px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        产品品类
                    </label>
                    <select
                        name="category"
                        // ✅ 使用 initialSearchParams（已解析）
                        defaultValue={initialSearchParams?.category || 'all'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">全部品类</option>
                        <option value="国产">国产</option>
                        <option value="进口">进口</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    筛选
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300"
                >
                    重置
                </button>
            </form>
        </div>
    )
}