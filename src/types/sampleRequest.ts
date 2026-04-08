export interface SampleApplication {
  id: string;
  status: string;               // TikTok status: PENDING etc.
  tiktok_status?: string;       // field name used when served from DB
  commission_rate: string;
  order_id: string;
  available_quantity: number;
  is_approvable: boolean;
  approve_expiration_time: number; // Unix timestamp

  // DB-side analysis fields (present when served from Firestore)
  analysis_status?: string;     // QUEUED | COMPLETED | FAILED
  review_status?: string;       // PENDING_REVIEW | APPROVED | REJECTED
  analysis_score?: number;
  final_decision?: string;
  filters_passed?: boolean;
  tier?: string;

  creator: {
    creator_open_id: string;
    username: string;
    nickname: string;
    follower_count: number;
    avatar_url?: string;
    content_count?: number;
    ec_video_view?: number;
    fulfillment_percentage?: string;
    gmv?: { amount: string; currency: string };
  };

  product: {
    id: string;
    title: string;
    sku_id: string;
    sku_name: string;
    sku_image_url?: string;
  };
}

export interface SampleListResponse {
  items: SampleApplication[];
  next_cursor: string | null;
  has_more: boolean;
}
