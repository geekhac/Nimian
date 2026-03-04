"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // 使用 router.back() 返回上一页，保持用户的分页和筛选状态
    router.back();
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:pointer transition-colors"
          style={{ cursor: "pointer" }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回上一页
        </button>
      </div>
    </div>
  );
}
