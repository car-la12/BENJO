CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  compare_at_price INTEGER CHECK (compare_at_price IS NULL OR compare_at_price > price),
  variant_name TEXT NOT NULL DEFAULT 'Standard',
  sku TEXT,
  track_inventory BOOLEAN NOT NULL DEFAULT FALSE,
  stock_quantity INTEGER CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  shipping_weight_grams INTEGER CHECK (shipping_weight_grams IS NULL OR shipping_weight_grams > 0),
  package_length_mm INTEGER CHECK (package_length_mm IS NULL OR package_length_mm > 0),
  package_width_mm INTEGER CHECK (package_width_mm IS NULL OR package_width_mm > 0),
  package_height_mm INTEGER CHECK (package_height_mm IS NULL OR package_height_mm > 0),
  fulfillment_notes TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL,
  steep TEXT NOT NULL DEFAULT '',
  temperature TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_name TEXT NOT NULL DEFAULT 'Standard';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER CHECK (stock_quantity IS NULL OR stock_quantity >= 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_weight_grams INTEGER CHECK (shipping_weight_grams IS NULL OR shipping_weight_grams > 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_length_mm INTEGER CHECK (package_length_mm IS NULL OR package_length_mm > 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_width_mm INTEGER CHECK (package_width_mm IS NULL OR package_width_mm > 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_height_mm INTEGER CHECK (package_height_mm IS NULL OR package_height_mm > 0);
ALTER TABLE products ADD COLUMN IF NOT EXISTS fulfillment_notes TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS products_active_name_idx
  ON products (is_active, name);

CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_idx
  ON products (sku)
  WHERE sku IS NOT NULL;
