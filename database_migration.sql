-- ============================================
-- Supabase 供应链表结构升级
-- 日期: 2026-01-30
-- 功能: 支持阶梯定价，大多数供应商保持统一价格
-- ============================================

-- 1. 在 supply_records 表添加 price_tiers 字段
ALTER TABLE supply_records
ADD COLUMN price_tiers JSONB DEFAULT NULL;

-- 2. 添加约束：确保 price_tiers 是有效的数组结构
ALTER TABLE supply_records
ADD CONSTRAINT check_price_tiers_structure
CHECK (
  price_tiers IS NULL OR (
    jsonb_typeof(price_tiers) = 'array' AND
    jsonb_array_length(price_tiers) > 0
  )
);

-- 3. 为价格查询创建 GIN 索引（用于 JSONB 查询优化）
CREATE INDEX idx_supply_records_price_tiers
ON supply_records USING GIN(price_tiers);

-- 4. 创建视图：方便查询统一价格的供应记录
CREATE OR REPLACE VIEW supply_records_with_prices AS
SELECT
  sr.id,
  sr.product_id,
  sr.supplier_id,
  sr.price,
  sr.moq,
  sr.price_tiers,
  -- 如果有阶梯定价，显示最小和最大价格范围
  CASE
    WHEN sr.price_tiers IS NOT NULL
    THEN (
      SELECT jsonb_agg(jsonb_build_object(
        'min_qty', (elem->>'min_qty')::integer,
        'max_qty', (elem->>'max_qty')::integer,
        'price', (elem->>'price')::decimal
      ))
      FROM jsonb_array_elements(sr.price_tiers) AS elem
    )
    ELSE NULL
  END AS tiers,
  -- 统一价格标志（没有 price_tiers 就是统一价格）
  (sr.price_tiers IS NULL) AS is_unified_price,
  sr.has_authorization,
  sr.has_certification,
  sr.is_active,
  sr.delivery_days,
  sr.valid_from,
  sr.valid_until,
  sr.notes,
  sr.created_at,
  sr.updated_at,
  p.product_name,
  sa.supplier_name
FROM supply_records sr
LEFT JOIN products p ON sr.product_id = p.id
LEFT JOIN supplier_assessment sa ON sr.supplier_id = sa.id;

-- 5. 数据迁移：将现有的 price + moq 转换为 price_tiers（可选）
-- 如果要保留原有的 price 作为统一价格的标志，可以不执行这段
-- 如果要完全迁移到新结构，则执行：
/*
UPDATE supply_records
SET price_tiers = jsonb_build_array(
  jsonb_build_object(
    'min_qty', moq,
    'max_qty', NULL,  -- NULL 表示无上限
    'price', price
  )
)
WHERE price_tiers IS NULL AND price IS NOT NULL;
*/

-- 6. 性能优化：为常用查询字段添加索引
CREATE INDEX idx_supply_records_product_supplier
ON supply_records(product_id, supplier_id)
WHERE is_active = true;

CREATE INDEX idx_supply_records_active_valid
ON supply_records(is_active, valid_from, valid_until);
