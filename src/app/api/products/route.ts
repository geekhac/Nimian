import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

// GET - 获取单个商品（按 id）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少商品ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        product_name,
        specification,
        description,
        brand_id,
        created_at,
        updated_at,
        brands:brand_id (brand_name)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - 创建商品
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("products")
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - 更新商品（使用 ?id=...）
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "缺少商品ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - 删除商品（使用 ?id=...）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少商品ID" }, { status: 400 });
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
