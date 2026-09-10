-- Atelier Artizan: Initial Database Schema
-- Luxury outdoor furniture platform

-- Auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COLLECTIONS
-- ============================================
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  hero_image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_is_active ON collections(is_active);
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- LATTICE STYLES
-- ============================================
CREATE TABLE lattice_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  collection_id UUID NOT NULL REFERENCES collections(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lattice_styles_slug ON lattice_styles(slug);
CREATE INDEX idx_lattice_styles_collection_id ON lattice_styles(collection_id);
CREATE TRIGGER update_lattice_styles_updated_at BEFORE UPDATE ON lattice_styles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  collection_id UUID NOT NULL REFERENCES collections(id),
  lattice_style_id UUID REFERENCES lattice_styles(id),
  category TEXT NOT NULL,
  dimensions_width NUMERIC,
  dimensions_depth NUMERIC,
  dimensions_height NUMERIC,
  dimensions_unit TEXT DEFAULT 'inches',
  weight_lbs NUMERIC,
  material_details TEXT,
  care_instructions TEXT,
  lead_time_days INT DEFAULT 56,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_collection_id ON products(collection_id);
CREATE INDEX idx_products_lattice_style_id ON products(lattice_style_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PRODUCT IMAGES
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ============================================
-- OPTION CATEGORIES (Finish, Fabric, Size, etc.)
-- ============================================
CREATE TABLE option_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_option_categories_slug ON option_categories(slug);

-- ============================================
-- OPTION VALUES (individual options within categories)
-- ============================================
CREATE TABLE option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES option_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color_hex TEXT,
  image_url TEXT,
  price_modifier NUMERIC(10,2) DEFAULT 0,
  price_modifier_type TEXT DEFAULT 'fixed' CHECK (price_modifier_type IN ('fixed', 'percentage')),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_option_values_category_id ON option_values(category_id);
CREATE INDEX idx_option_values_slug ON option_values(slug);

-- ============================================
-- PRODUCT <-> OPTION CATEGORIES mapping
-- ============================================
CREATE TABLE product_option_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES option_categories(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

CREATE INDEX idx_product_option_categories_product_id ON product_option_categories(product_id);
CREATE INDEX idx_product_option_categories_category_id ON product_option_categories(category_id);

-- ============================================
-- PRODUCT SKUS (specific purchasable variants)
-- ============================================
CREATE TABLE product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_override NUMERIC(10,2),
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_skus_product_id ON product_skus(product_id);
CREATE INDEX idx_product_skus_sku_code ON product_skus(sku_code);
CREATE TRIGGER update_product_skus_updated_at BEFORE UPDATE ON product_skus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SKU <-> OPTION VALUES mapping
-- ============================================
CREATE TABLE sku_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id UUID NOT NULL REFERENCES product_skus(id) ON DELETE CASCADE,
  option_value_id UUID NOT NULL REFERENCES option_values(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sku_id, option_value_id)
);

CREATE INDEX idx_sku_option_values_sku_id ON sku_option_values(sku_id);
CREATE INDEX idx_sku_option_values_option_value_id ON sku_option_values(option_value_id);

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- QUOTES
-- ============================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired')),
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax_rate NUMERIC(5,4) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  internal_notes TEXT,
  valid_until TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- QUOTE ITEMS
-- ============================================
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  sku_id UUID REFERENCES product_skus(id),
  quantity INT DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

-- ============================================
-- QUOTE ITEM OPTIONS
-- ============================================
CREATE TABLE quote_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_item_id UUID NOT NULL REFERENCES quote_items(id) ON DELETE CASCADE,
  option_value_id UUID NOT NULL REFERENCES option_values(id),
  price_modifier NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_item_options_quote_item_id ON quote_item_options(quote_item_id);

-- ============================================
-- CONSULTATIONS
-- ============================================
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('residential', 'commercial', 'hospitality')),
  project_description TEXT,
  preferred_date DATE NOT NULL,
  preferred_time TEXT,
  alternative_date DATE,
  budget_range TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_customer_email ON consultations(customer_email);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_preferred_date ON consultations(preferred_date);
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'US',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_intent_id TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  shipping_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  sku_id UUID REFERENCES product_skus(id),
  quantity INT DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ============================================
-- ORDER ITEM OPTIONS
-- ============================================
CREATE TABLE order_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_value_id UUID NOT NULL REFERENCES option_values(id),
  price_modifier NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_item_options_order_item_id ON order_item_options(order_item_id);

-- ============================================
-- SITE SETTINGS
-- ============================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_settings_key ON site_settings(key);
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lattice_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog tables
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read lattice_styles" ON lattice_styles FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read option_categories" ON option_categories FOR SELECT USING (true);
CREATE POLICY "Public read option_values" ON option_values FOR SELECT USING (true);
CREATE POLICY "Public read product_option_categories" ON product_option_categories FOR SELECT USING (true);
CREATE POLICY "Public read product_skus" ON product_skus FOR SELECT USING (true);
CREATE POLICY "Public read sku_option_values" ON sku_option_values FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Public insert for consultations (contact form)
CREATE POLICY "Public insert consultations" ON consultations FOR INSERT WITH CHECK (true);

-- Authenticated full access for admin tables
CREATE POLICY "Authenticated full access collections" ON collections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access lattice_styles" ON lattice_styles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access product_images" ON product_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access option_categories" ON option_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access option_values" ON option_values FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access product_option_categories" ON product_option_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access product_skus" ON product_skus FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access sku_option_values" ON sku_option_values FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access quotes" ON quotes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access quote_items" ON quote_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access quote_item_options" ON quote_item_options FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access consultations" ON consultations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access order_item_options" ON order_item_options FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
