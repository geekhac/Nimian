-- ============================================
-- 供应商表添加链接字段
-- 日期: 2026-02-03
-- 功能: 支持供应商提供官网或业务链接
-- ============================================

-- 1. 添加链接字段
ALTER TABLE supplier_assessment
ADD COLUMN supplier_link TEXT NULL;

-- 2. 添加注释
COMMENT ON COLUMN supplier_assessment.supplier_link IS '供应商官网或业务链接，非必填';
