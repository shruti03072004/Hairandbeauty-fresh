package com.salon.backend.controller;

import com.razorpay.*;
import com.salon.backend.dto.PaymentVerifyRequest;
import com.salon.backend.entity.Appointment;
import com.salon.backend.repository.AppointmentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.salon.backend.service.EmailService;


import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://hairandbeauty-fresh.vercel.app"
})public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final AppointmentRepository repo;
    private final EmailService emailService;

    public PaymentController(AppointmentRepository repo,EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;

    }

    // =========================
    // STEP 1: CREATE ORDER
    // =========================
    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestBody Map<String, Integer> data) throws Exception {

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        int amount = data.get("amount") * 100; // ✅ rupees → paise

        JSONObject options = new JSONObject();
        options.put("amount", amount);
        options.put("currency", "INR");
        options.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = client.orders.create(options);

        Map<String, Object> res = new HashMap<>();
        res.put("orderId", order.get("id"));
        res.put("amount", amount);
        res.put("currency", "INR");   // 🔥 ADD THIS
        res.put("key", keyId);

        return res;
    }

    // =========================
    // STEP 2: VERIFY + SAVE
    // =========================
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody PaymentVerifyRequest req) throws Exception {

        String payload =
                req.razorpay_order_id + "|" + req.razorpay_payment_id;

        String generatedSignature =
                hmacSha256Hex(payload, keySecret);

        if (!generatedSignature.equals(req.razorpay_signature)) {
            return ResponseEntity.badRequest().body("❌ Payment verification failed");
        }




        // ✅ SAVE APPOINTMENT
        Appointment a = new Appointment();
        a.setName(req.appointment.get("name"));
        a.setPhone(req.appointment.get("phone"));
        a.setEmail(req.appointment.get("email"));
        a.setService(req.appointment.get("service"));
        a.setDate(req.appointment.get("date"));
        a.setTime(req.appointment.get("time"));
        a.setOrderId(req.razorpay_order_id);
        a.setPaymentId(req.razorpay_payment_id);
        a.setStatus("PAID");

        repo.save(a);
// 🔥 SEND EMAIL
        emailService.sendBookingConfirmation(a);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "appointmentId", a.getId()
        ));
    }

    // =========================
    // HMAC SHA256 → HEX
    // =========================
    private String hmacSha256Hex(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));

        byte[] hash = mac.doFinal(data.getBytes());

        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }
}
