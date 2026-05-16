package com.salon.backend.dto;

import java.util.Map;

public class PaymentVerifyRequest {
    public String razorpay_payment_id;
    public String razorpay_order_id;
    public String razorpay_signature;
    public Map<String, String> appointment;
}
