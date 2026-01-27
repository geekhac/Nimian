// src/components/SupplierStats.js
export default function SupplierStats({ suppliers }) {
    // 计算统计数据
    const totalSuppliers = suppliers.length
    const totalOrders = suppliers.reduce((sum, supplier) => sum + supplier.total_orders, 0)
    const totalAmount = suppliers.reduce((sum, supplier) => sum + supplier.total_amount, 0)
    const avgQuality = suppliers.length > 0
        ? suppliers.reduce((sum, supplier) => sum + supplier.product_quality, 0) / suppliers.length
        : 0
    const totalProblemOrders = suppliers.reduce((sum, supplier) => sum + supplier.problem_orders, 0)
    const problemRate = totalOrders > 0 ? (totalProblemOrders / totalOrders * 100).toFixed(1) : 0

    const stats = [
        { name: '供应商总数', value: totalSuppliers, change: '+4', changeType: 'positive' },
        { name: '总订单量', value: totalOrders.toLocaleString(), change: '+12.5%', changeType: 'positive' },
        { name: '总交易金额', value: `¥${totalAmount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`, change: '+19.2%', changeType: 'positive' },
        { name: '平均质量评分', value: avgQuality.toFixed(1), change: '+0.3', changeType: 'positive' },
        { name: '问题订单率', value: `${problemRate}%`, change: '-2.1%', changeType: 'negative' },
    ]

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 truncate">
                                        {stat.name}
                                    </p>
                                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className={`inline-flex items-center text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {stat.changeType === 'positive' ? '↗' : '↘'} {stat.change}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">较上月</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}