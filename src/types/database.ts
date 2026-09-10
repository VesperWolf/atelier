export type Database = {
  public: {
    Tables: {
      collections: {
        Row: Collection;
        Insert: Omit<Collection, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Collection, "id" | "created_at">>;
        Relationships: [];
      };
      lattice_styles: {
        Row: LatticeStyle;
        Insert: Omit<LatticeStyle, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<LatticeStyle, "id" | "created_at">>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at">>;
        Relationships: [];
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, "id" | "created_at">;
        Update: Partial<Omit<ProductImage, "id" | "created_at">>;
        Relationships: [];
      };
      option_categories: {
        Row: OptionCategory;
        Insert: Omit<OptionCategory, "id" | "created_at">;
        Update: Partial<Omit<OptionCategory, "id" | "created_at">>;
        Relationships: [];
      };
      option_values: {
        Row: OptionValue;
        Insert: Omit<OptionValue, "id" | "created_at">;
        Update: Partial<Omit<OptionValue, "id" | "created_at">>;
        Relationships: [];
      };
      product_option_categories: {
        Row: ProductOptionCategory;
        Insert: Omit<ProductOptionCategory, "id" | "created_at">;
        Update: Partial<Omit<ProductOptionCategory, "id" | "created_at">>;
        Relationships: [];
      };
      product_skus: {
        Row: ProductSku;
        Insert: Omit<ProductSku, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProductSku, "id" | "created_at">>;
        Relationships: [];
      };
      sku_option_values: {
        Row: SkuOptionValue;
        Insert: Omit<SkuOptionValue, "id" | "created_at">;
        Update: Partial<Omit<SkuOptionValue, "id" | "created_at">>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Customer, "id" | "created_at">>;
        Relationships: [];
      };
      quotes: {
        Row: Quote;
        Insert: Omit<Quote, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Quote, "id" | "created_at">>;
        Relationships: [];
      };
      quote_items: {
        Row: QuoteItem;
        Insert: Omit<QuoteItem, "id" | "created_at">;
        Update: Partial<Omit<QuoteItem, "id" | "created_at">>;
        Relationships: [];
      };
      quote_item_options: {
        Row: QuoteItemOption;
        Insert: Omit<QuoteItemOption, "id" | "created_at">;
        Update: Partial<Omit<QuoteItemOption, "id" | "created_at">>;
        Relationships: [];
      };
      consultations: {
        Row: Consultation;
        Insert: Omit<Consultation, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Consultation, "id" | "created_at">>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id" | "created_at">>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at">;
        Update: Partial<Omit<OrderItem, "id" | "created_at">>;
        Relationships: [];
      };
      order_item_options: {
        Row: OrderItemOption;
        Insert: Omit<OrderItemOption, "id" | "created_at">;
        Update: Partial<Omit<OrderItemOption, "id" | "created_at">>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<SiteSetting, "id" | "created_at">>;
        Relationships: [];
      };
      page_sections: {
        Row: PageSection;
        Insert: Omit<PageSection, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PageSection, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  hero_image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LatticeStyle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  collection_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: number;
  collection_id: string;
  lattice_style_id: string | null;
  category: string;
  dimensions_width: number | null;
  dimensions_depth: number | null;
  dimensions_height: number | null;
  dimensions_unit: string;
  weight_lbs: number | null;
  material_details: string | null;
  care_instructions: string | null;
  lead_time_days: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface OptionCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface OptionValue {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  color_hex: string | null;
  image_url: string | null;
  price_modifier: number;
  price_modifier_type: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductOptionCategory {
  id: string;
  product_id: string;
  category_id: string;
  is_required: boolean;
  created_at: string;
}

export interface ProductSku {
  id: string;
  product_id: string;
  sku_code: string;
  name: string;
  price_override: number | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkuOptionValue {
  id: string;
  sku_id: string;
  option_value_id: string;
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  company: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_company: string | null;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  notes: string | null;
  internal_notes: string | null;
  valid_until: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string;
  sku_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface QuoteItemOption {
  id: string;
  quote_item_id: string;
  option_value_id: string;
  price_modifier: number;
  created_at: string;
}

export interface Consultation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_company: string | null;
  project_type: "residential" | "commercial" | "hospitality";
  project_description: string | null;
  preferred_date: string;
  preferred_time: string | null;
  alternative_date: string | null;
  budget_range: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  status: "pending" | "confirmed" | "in_production" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "refunded";
  payment_intent_id: string | null;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  sku_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OrderItemOption {
  id: string;
  order_item_id: string;
  option_value_id: string;
  price_modifier: number;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  id: string;
  page_slug: string;
  section_type: string;
  title: string | null;
  content: Record<string, unknown>;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface ProductWithRelations extends Product {
  collection?: Collection;
  lattice_style?: LatticeStyle;
  images?: ProductImage[];
  option_categories?: (ProductOptionCategory & {
    category?: OptionCategory & {
      values?: OptionValue[];
    };
  })[];
  skus?: ProductSku[];
}

export interface QuoteWithRelations extends Quote {
  customer?: Customer;
  items?: (QuoteItem & {
    product?: Product;
    sku?: ProductSku;
    options?: (QuoteItemOption & {
      option_value?: OptionValue;
    })[];
  })[];
}

export interface OrderWithRelations extends Order {
  customer?: Customer;
  items?: (OrderItem & {
    product?: Product;
    sku?: ProductSku;
    options?: (OrderItemOption & {
      option_value?: OptionValue;
    })[];
  })[];
}

// Cart types (client-side)
export interface CartItem {
  product: Product;
  sku?: ProductSku;
  selectedOptions: {
    category: OptionCategory;
    value: OptionValue;
  }[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
