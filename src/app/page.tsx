// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }

// src/app/dashboard/page.js
import { createClient } from '@/lib/supabase/server-client' // 根据你的路径调整

export default async function DashboardPage() {
  // 1. 创建服务端Supabase客户端
  const supabase = await createClient()
  
  // 2. 查询商家信息表
  const { data: merchants, error } = await supabase
    .from('merchants') // 这里改成你刚创建的表名
    .select('*')
    .order('joined_at', { ascending: false }) // 按加入时间倒序排列

  // 3. 处理错误
  if (error) {
    return <div className="p-4 text-red-600">加载失败: {error.message}</div>
  }

  // 4. 渲染数据
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">商家信息总览</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {merchants.map((merchant) => (
          <div key={merchant.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{merchant.nickname}</h2>
            <p className="text-gray-600 mb-1">联系方式: {merchant.contact}</p>
            <p className="text-sm text-gray-500 mb-3">
              加入时间: {new Date(merchant.joined_at).toLocaleDateString('zh-CN')}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>总成交单量:</span>
                <span className="font-medium">{merchant.total_orders}</span>
              </div>
              <div className="flex justify-between">
                <span>总成交金额:</span>
                <span className="font-medium">¥{merchant.total_amount.toLocaleString('zh-CN')}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>问题单量:</span>
                <span className="font-medium">{merchant.problematic_orders}</span>
              </div>
              <div className="flex justify-between text-orange-600">
                <span>问题金额:</span>
                <span className="font-medium">¥{merchant.problematic_amount.toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}