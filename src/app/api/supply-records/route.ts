import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

// GET - 获取供应记录（带商品和供应商信息）
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const productId = searchParams.get("productId");
    const supplierId = searchParams.get("supplierId");

    let query = supabase
      .from("supply_records")
      .select(`
        id,
        product_id,
        supplier_id,
        price,
        moq,
        price_tiers,
        has_authorization,
        has_certification,
        is_active,
        delivery_days,
        valid_from,
        valid_until,
        notes,
        created_at,
        updated_at,
        products (
          id,
          product_name
        ),
        supplier_assessment (
          id,
          supplier_name
        )
      `);

    if (id) {
      const { data, error } = await query.eq("id", id).single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (productId) {
      query = query.eq("product_id", productId);
    }

    if (supplierId) {
      query = query.eq("supplier_id", supplierId);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - 创建供应记录
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("supply_records")
      .insert([body])
      .select(`
        id,
        product_id,
        supplier_id,
        price,
        moq,
        price_tiers,
        has_authorization,
        has_certification,
        is_active,
        delivery_days,
        valid_from,
        valid_until,
        notes,
        created_at,
        updated_at,
        products (
          id,
          product_name
        ),
        supplier_assessment (
          id,
          supplier_name
        )
      `)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - 更新供应记录
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "缺少供应记录ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("supply_records")
      .update(body)
      .eq("id", id)
      .select(`
        id,
        product_id,
        supplier_id,
        price,
        moq,
        price_tiers,
        has_authorization,
        has_certification,
        is_active,
        delivery_days,
        valid_from,
        valid_until,
        notes,
        created_at,
        updated_at,
        products (
          id,
          product_name
        ),
        supplier_assessment (
          id,
          supplier_name
        )
      `)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - 删除供应记录
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "缺少供应记录ID" }, { status: 400 });
    }

    const { error } = await supabase.from("supply_records").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
