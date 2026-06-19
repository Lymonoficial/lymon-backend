export interface WompiWebhookPayload {
  event: string;
  data: {
    transaction: {
      id: string;
      status: string;
      reference: string;
      amount_in_cents: number;
      currency: string;
      payment_method_type: string;
      created_at: string;
    };
  };
  signature: {
    checksum: string;
    properties: string[];
  };
  timestamp: number;
  environment: string;
}
