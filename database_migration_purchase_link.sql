-- ============================================
-- 供应链表添加购买链接字段
-- 日期: 2026-02-03
-- 功能: 支持每个商品的每个供应商提供购买链接
-- ============================================

-- 1. 添加购买链接字段
ALTER TABLE supply_records
ADD COLUMN purchase_link TEXT NULL;

-- 2. 添加注释
COMMENT ON COLUMN supply_records.purchase_link IS '供应商购买链接，非必填';

-- 3. 为购买链接字段添加索引（可选，用于查询优化）
CREATE INDEX IF NOT EXISTS idx_supply_records_purchase_link 
ON supply_records(purchase_link) 
WHERE purchase_link IS NOT NULL;
