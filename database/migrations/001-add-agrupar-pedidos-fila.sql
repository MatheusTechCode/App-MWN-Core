-- Migration: Add agrupar_pedidos_fila column to cozinha_configuracoes
-- This migration adds support for automatic order grouping in queue

ALTER TABLE cozinha_configuracoes
ADD COLUMN IF NOT EXISTS agrupar_pedidos_fila BOOLEAN NOT NULL DEFAULT true;

-- Update existing records to have the new column
UPDATE cozinha_configuracoes
SET agrupar_pedidos_fila = true
WHERE agrupar_pedidos_fila IS NULL;
