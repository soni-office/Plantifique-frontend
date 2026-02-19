export interface SampleRequestResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    next_page_token: string;
    total_count: number;
    sample_applications: SampleApplication[];
  };
}

export interface SampleApplication {
  id: string;
  commission_rate: string;
  status: string;
  order_id: string;
  available_quantity: number;
  fulfillment_status: string;

  creator: {
    username: string;
    nickname: string;
    follower_count: number;
  };

  product: {
    id: string;
    title: string;
    sku_id: string;
    sku_name: string;
  };
}
