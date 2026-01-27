// src/components/SupplierTable.js
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import React from 'react'

export default function SupplierTable({ suppliers }) {
    const router = useRouter()
    const [expandedRow, setExpandedRow] = useState(null)

    // 计算问题率
    const calculateProblemRate = (supplier) => {
        if (supplier.total_orders === 0) return '0%'
        return ((supplier.problem_orders / supplier.total_orders) * 100).toFixed(1) + '%'
    }

    // 获取质量评分星星
    const renderQualityStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating)
    }

    // 删除供应商
    const handleDelete = async (id, supplierName) => {
        if (!confirm(`确定要删除供应商 "${supplierName}" 吗？此操作不可撤销。`)) {
            return
        }

        try {
            const response = await fetch(`/api/suppliers/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                router.refresh() // 刷新数据
                alert('删除成功')
            } else {
                throw new Error('删除失败')
            }
        } catch (error) {
            alert('删除失败: ' + error.message)
        }
    }

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                供应商信息
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                财务数据
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                履约表现
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {suppliers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                    暂无供应商数据
                                </td>
                            </tr>
                        ) : (
                            suppliers.map((supplier) => (
                                <React.Fragment key={supplier.id}>
                                    <tr
                                        key={supplier.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setExpandedRow(expandedRow === supplier.id ? null : supplier.id)}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        <div className="text-lg font-medium text-gray-900">
                                                            {supplier.supplier_name}
                                                        </div>
                                                        <div className="mt-1 space-y-1">
                                                            <div className="text-sm text-gray-600">
                                                                <span className="font-medium">地区:</span> {supplier.region}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                <span className="font-medium">注册资本:</span> {supplier.registered_capital}万元
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                <span className="font-medium">品类:</span> {supplier.product_categories?.join(', ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        总订单: {supplier.total_orders}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        总金额: ¥{supplier.total_amount?.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-red-600">
                                                        问题订单: {supplier.problem_orders}
                                                    </div>
                                                    <div className="text-sm text-red-600">
                                                        问题金额: ¥{supplier.problem_amount?.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="text-sm">
                                                    <span className="font-medium">发货速度:</span> {supplier.delivery_speed}
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">产品质量:</span>
                                                    <span className="ml-2 text-yellow-500">
                                                        {renderQualityStars(supplier.product_quality)}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">包装质量:</span>
                                                    <span className="ml-2 text-yellow-500">
                                                        {renderQualityStars(supplier.packaging)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <Link
                                                    href={`/suppliers/${supplier.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    详情
                                                </Link>
                                                <Link
                                                    href={`/suppliers/${supplier.id}/edit`}
                                                    className="text-green-600 hover:text-green-900"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    编辑
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDelete(supplier.id, supplier.supplier_name)
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* 可展开的详情行 */}
                                    {expandedRow === supplier.id && (
                                        <tr className="bg-blue-50">
                                            <td colSpan="4" className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <h4 className="font-medium mb-2">基础信息</h4>
                                                        <p><strong>资质类型:</strong> {supplier.qualification_type}</p>
                                                        <p><strong>供应渠道:</strong> {supplier.supply_channel}</p>
                                                        <p><strong>问题订单率:</strong> {calculateProblemRate(supplier)}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium mb-2">关键指标</h4>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between">
                                                                <span>订单完成度:</span>
                                                                <span className="font-medium">98.5%</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>准时交付率:</span>
                                                                <span className="font-medium">96.2%</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>客户满意度:</span>
                                                                <span className="font-medium">4.3/5.0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium mb-2">最近活动</h4>
                                                        <p>最近订单: 2024-03-15</p>
                                                        <p>评估更新: {supplier.updated_at ? new Date(supplier.updated_at).toLocaleDateString('zh-CN') : '暂无'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}