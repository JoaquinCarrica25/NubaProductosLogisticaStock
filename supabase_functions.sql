-- ============================================================
--  FUNCIÓN SQL: decrementar_stock_producto
--  Pega esto también en el SQL Editor de Supabase
--  Esta función se llama cuando se marca un pedido como entregado
-- ============================================================

CREATE OR REPLACE FUNCTION decrementar_stock_producto(
  p_producto_id UUID,
  p_cantidad INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE productos
  SET stock_general = GREATEST(0, stock_general - p_cantidad),
      updated_at = NOW()
  WHERE id = p_producto_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permiso al usuario anónimo para ejecutarla
GRANT EXECUTE ON FUNCTION decrementar_stock_producto(UUID, INTEGER) TO anon;

-- ============================================================
--  FUNCIÓN SQL: incrementar_stock_apartamento
--  Hace un upsert inteligente del stock por apartamento
-- ============================================================

CREATE OR REPLACE FUNCTION incrementar_stock_apartamento(
  p_apartamento_id UUID,
  p_producto_id UUID,
  p_cantidad INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO stock_apartamento (apartamento_id, producto_id, cantidad)
  VALUES (p_apartamento_id, p_producto_id, p_cantidad)
  ON CONFLICT (apartamento_id, producto_id)
  DO UPDATE SET
    cantidad = stock_apartamento.cantidad + p_cantidad,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION incrementar_stock_apartamento(UUID, UUID, INTEGER) TO anon;
