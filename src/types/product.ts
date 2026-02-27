export interface ProductImage {
  urls?: string[];
  thumb_urls?: string[];
}

export interface ProductSku {
  id: string;
  seller_sku?: string;
  price?: {
    currency?: string;
    sale_price?: string;
    tax_exclusive_price?: string;
  };
  status_info?: {
    status?: string;
  };
}

export interface ProductDetails {
  id: string;
  title: string;
  description?: string;
  status?: string;
  listing_quality_tier?: string;
  product_status?: string;
  create_time?: number;
  update_time?: number;
  brand?: {
    id: string;
    name: string;
  };
  category_chains?: Array<{
    id: string;
    local_name: string;
    parent_id: string;
    is_leaf: boolean;
  }>;
  audit?: {
    status?: string;
    pre_approved_reasons?: string[];
  };
  package_dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    unit?: string;
  };
  package_weight?: {
    value?: string;
    unit?: string;
  };
  product_attributes?: Array<{
    id: string;
    name: string;
    values?: Array<{
      id?: string;
      name?: string;
    }>;
  }>;
  main_images?: ProductImage[];
  skus?: ProductSku[];
}
