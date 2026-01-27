// src/app/api/suppliers/[id]/route.js
import { createClient } from '@/lib/supabase/server-client'

export async function DELETE(request, { params }) {
    try {
        const { id } = params
        const supabase = await createClient()

        const { error } = await supabase
            .from('supplier_assessment')
            .delete()
            .eq('id', id)

        if (error) {
            return Response.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return Response.json(
            { message: '供应商删除成功' },
            { status: 200 }
        )
    } catch (error) {
        return Response.json(
            { error: '服务器内部错误' },
            { status: 500 }
        )
    }
}