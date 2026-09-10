-- Seed: Heritage Collection
INSERT INTO collections (name, slug, description, sort_order) VALUES (
  'Heritage',
  'heritage',
  'At Atelier Artizan, we celebrate the artistry of the past by thoughtfully reinterpreting timeless design elements for modern outdoor living. Our Heritage Collection draws from centuries of craftsmanship, blending historical motifs with contemporary aesthetics.',
  1
);

-- Seed: Lattice Styles
INSERT INTO lattice_styles (name, slug, description, collection_id, sort_order) VALUES
(
  'Artizan',
  'artizan',
  'Our signature diamond lattice brings timeless elegance and sophistication to our Heritage collection. The diamond motif, woven throughout our brand, symbolizes strength and resilience; all core qualities we proudly embrace.',
  (SELECT id FROM collections WHERE slug = 'heritage'),
  1
),
(
  'Capri',
  'capri',
  'Inspired by the iconic chair silhouettes found along the coasts and in the gardens of Italy, our Capri style draws from the renowned woven lattices of Mario Papperzini. Capri honors this distinguished legacy while infusing a classic aesthetic with a modern twist.',
  (SELECT id FROM collections WHERE slug = 'heritage'),
  2
),
(
  'Monaco',
  'monaco',
  'Paying homage to Monaco''s vibrant racing heritage, our Monaco style features a hand-woven pattern that elegantly echoes the iconic Checkered Flag. Each piece captures the spirit of classic European motorsport, blending timeless craftsmanship with a nod to the sophistication and prestige of the Grand Prix.',
  (SELECT id FROM collections WHERE slug = 'heritage'),
  3
);

-- Seed: Option Categories
INSERT INTO option_categories (name, slug, description, sort_order) VALUES
('Powder Coat Finish', 'powder-coat-finish', 'Architectural-rated powder coat finishes for carbon steel frames. Each frame undergoes hot-dip galvanizing before finishing.', 1),
('Fabric', 'fabric', 'Premium outdoor fabrics from Sunbrella and Perennials collections, selected for durability and luxurious feel.', 2);

-- Seed: Powder Coat Finish Options
INSERT INTO option_values (category_id, name, slug, description, color_hex, price_modifier, sort_order) VALUES
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Matte Black', 'matte-black', 'Classic matte black finish', '#1A1A1A', 0, 1),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Satin White', 'satin-white', 'Soft satin white finish', '#F5F5F0', 0, 2),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Brushed Bronze', 'brushed-bronze', 'Warm brushed bronze metallic', '#8C6B3E', 150, 3),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Antique Brass', 'antique-brass', 'Rich antique brass tone', '#B8956A', 150, 4),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Pewter', 'pewter', 'Classic pewter gray metallic', '#8F9196', 100, 5),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Graphite', 'graphite', 'Deep graphite finish', '#3D3D3D', 0, 6),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Warm Silver', 'warm-silver', 'Subtle warm silver metallic', '#C0B8A8', 100, 7),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Oil Rubbed Bronze', 'oil-rubbed-bronze', 'Deep oil rubbed bronze', '#4A3728', 175, 8),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Champagne Gold', 'champagne-gold', 'Elegant champagne gold metallic', '#D4AF7A', 200, 9),
((SELECT id FROM option_categories WHERE slug = 'powder-coat-finish'), 'Forest Green', 'forest-green', 'Rich forest green', '#2D4A3E', 100, 10);

-- Seed: Sunbrella Fabric Options
INSERT INTO option_values (category_id, name, slug, description, color_hex, price_modifier, sort_order) VALUES
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Canvas White', 'canvas-white', 'Sunbrella Canvas White', '#FAFAFA', 0, 1),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Canvas Black', 'canvas-black', 'Sunbrella Canvas Black', '#1C1C1C', 0, 2),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Canvas Taupe', 'canvas-taupe', 'Sunbrella Canvas Taupe', '#9B8E7E', 0, 3),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Linen Champagne', 'linen-champagne', 'Sunbrella Linen Champagne', '#E8DFD0', 50, 4),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Heritage Granite', 'heritage-granite', 'Sunbrella Heritage Granite', '#7A7368', 75, 5),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Heritage Papyrus', 'heritage-papyrus', 'Sunbrella Heritage Papyrus', '#E5DCC8', 75, 6),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Spectrum Dove', 'spectrum-dove', 'Sunbrella Spectrum Dove', '#B8B0A4', 50, 7),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Spectrum Carbon', 'spectrum-carbon', 'Sunbrella Spectrum Carbon', '#3E3C38', 50, 8),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Cast Slate', 'cast-slate', 'Sunbrella Cast Slate', '#5C5C5C', 50, 9),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Cast Ash', 'cast-ash', 'Sunbrella Cast Ash', '#A8A098', 50, 10),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Canvas Navy', 'canvas-navy', 'Sunbrella Canvas Navy', '#1E2A3A', 0, 11);

-- Seed: Perennials Fabric Options
INSERT INTO option_values (category_id, name, slug, description, color_hex, price_modifier, sort_order) VALUES
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Ishi Pumice', 'ishi-pumice', 'Perennials Ishi Pumice', '#C4BCB0', 150, 12),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Ishi Flax', 'ishi-flax', 'Perennials Ishi Flax', '#D6CCBA', 150, 13),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Rough N Rowdy Platinum', 'rough-n-rowdy-platinum', 'Perennials Rough N Rowdy Platinum', '#B0AAA0', 175, 14),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Rough N Rowdy Coal', 'rough-n-rowdy-coal', 'Perennials Rough N Rowdy Coal', '#2E2E2E', 175, 15),
((SELECT id FROM option_categories WHERE slug = 'fabric'), 'Chelsey Stripe Sand', 'chelsey-stripe-sand', 'Perennials Chelsey Stripe Sand', '#D4C8B4', 200, 16);
