-- Storage buckets for product images and site assets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Storage policies: public read, authenticated write
CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated update product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public read site-assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Authenticated upload site-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated update site-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete site-assets" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

-- ============================================
-- PAGE SECTIONS (for visual page builder)
-- ============================================
CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL DEFAULT 'homepage',
  section_type TEXT NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_page_sections_page_slug ON page_sections(page_slug);
CREATE INDEX idx_page_sections_display_order ON page_sections(display_order);
CREATE TRIGGER update_page_sections_updated_at BEFORE UPDATE ON page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read page_sections" ON page_sections FOR SELECT USING (true);
CREATE POLICY "Authenticated full access page_sections" ON page_sections FOR ALL USING (auth.role() = 'authenticated');

-- Seed default homepage sections matching the current landing page
INSERT INTO page_sections (page_slug, section_type, title, content, display_order, is_visible) VALUES
  ('homepage', 'hero', 'Hero', '{"heading": "Engineered for the Elements", "subheading": "Built to Last Generations", "image_url": "/images/hero-chaise.png", "cta_text": "Explore Collection", "cta_link": "/products"}', 0, true),
  ('homepage', 'heritage', 'Heritage Collection', '{"heading": "The Heritage Collection", "description": "Where timeless design meets uncompromising durability. Each piece in our Heritage Collection is handcrafted from carbon steel and finished with our signature lattice patterns."}', 1, true),
  ('homepage', 'lattice_showcase', 'Lattice Showcase', '{"heading": "Signature Lattice Patterns"}', 2, true),
  ('homepage', 'craftsmanship', 'Craftsmanship', '{"heading": "The Art of Craft", "description": "Every piece begins as raw carbon steel, transformed by skilled artisans in our Tennessee atelier."}', 3, true),
  ('homepage', 'materials', 'Materials', '{"heading": "Premium Materials", "description": "We source only the finest materials to ensure lasting beauty and performance."}', 4, true),
  ('homepage', 'product_grid', 'Featured Products', '{"heading": "Our Collection", "show_prices": true, "columns": 3, "featured_only": true}', 5, true),
  ('homepage', 'cta', 'Consultation CTA', '{"heading": "Begin Your Journey", "description": "Schedule a private consultation with our design team to explore the possibilities.", "button_text": "Book a Consultation", "button_link": "/consultation"}', 6, true);
