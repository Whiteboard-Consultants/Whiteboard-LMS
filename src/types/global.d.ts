export {};

interface RazorpayPaymentFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    }
  }
}

type RazorpayNotes = {
  [key: string]: string | number | boolean;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { 
      open: () => void; 
      on: (event: string, callback: (response: RazorpayPaymentFailedResponse) => void) => void 
    };
  }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }) => void;
    prefill: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: RazorpayNotes;
    theme?: {
        color?: string;
    };
}
