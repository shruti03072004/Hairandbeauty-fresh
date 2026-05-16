package com.salon.backend.service;

import com.salon.backend.entity.Appointment;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendBookingConfirmation(Appointment a) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(a.getEmail());
            helper.setSubject("✨ Your Appointment is Confirmed – Hair&Beauty Studio");

            String html = buildHtml(a);
            helper.setText(html, true); // ✅ HTML enabled

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String buildHtml(Appointment a) {

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin:0; padding:0; background:#f5f3ef; font-family:'Poppins',Arial,sans-serif;">
            
            <div style="max-width:600px; margin:0 auto; padding:12px;">
                
                <!-- Main Card -->
                <div style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(143,106,59,0.12);">
                    
                    <!-- Header -->
                    <div style="background:linear-gradient(135deg,#8f6a3b 0%%,#a8845f 100%%); padding:20px; text-align:center;">
                        <h1 style="margin:0; color:#fff; font-size:24px; font-weight:700; letter-spacing:0.5px;">Hair&Beauty</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding:20px 16px;">
                        
                        <!-- Success Badge -->
                        <div style="text-align:center; margin-bottom:16px;">
                            <span style="display:inline-block; background:linear-gradient(135deg,#10b981 0%%,#059669 100%%); color:#fff; padding:6px 16px; border-radius:50px; font-size:12px; font-weight:600; box-shadow:0 3px 10px rgba(16,185,129,0.25);">
                                ✓ CONFIRMED
                            </span>
                        </div>
                        
                        <!-- Greeting -->
                        <h2 style="margin:0 0 6px 0; color:#1f2937; font-size:18px; font-weight:700; text-align:center;">
                            Hi %s! 👋
                        </h2>
                        <p style="margin:0 0 16px 0; color:#6b7280; font-size:13px; text-align:center;">
                            Your appointment is all set!
                        </p>
                        
                        <!-- Details Card -->
                        <div style="background:linear-gradient(135deg,#faf9f7 0%%,#f5f3ef 100%%); border-radius:12px; padding:16px; margin-bottom:16px; box-shadow:0 2px 8px rgba(143,106,59,0.06);">
                            
                            <!-- Service -->
                            <div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px dashed rgba(143,106,59,0.2);">
                                <div style="color:#6b7280; font-size:11px; margin-bottom:3px;">Service</div>
                                <div style="color:#1f2937; font-size:14px; font-weight:700;">%s</div>
                            </div>
                            
                            <!-- Date & Time -->
                            <table style="width:100%%; margin-bottom:12px; padding-bottom:10px; border-bottom:1px dashed rgba(143,106,59,0.2);" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width:50%%; padding-right:6px;">
                                        <div style="color:#6b7280; font-size:11px; margin-bottom:3px;">📅 Date</div>
                                        <div style="color:#1f2937; font-size:13px; font-weight:600;">%s</div>
                                    </td>
                                    <td style="width:50%%; padding-left:6px;">
                                        <div style="color:#6b7280; font-size:11px; margin-bottom:3px;">🕐 Time</div>
                                        <div style="color:#1f2937; font-size:13px; font-weight:600;">%s</div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Amount -->
                            <div style="background:linear-gradient(135deg,#8f6a3b 0%%,#a8845f 100%%); padding:12px; border-radius:10px; box-shadow:0 3px 10px rgba(143,106,59,0.2);">
                                <table style="width:100%%;" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="color:rgba(255,255,255,0.95); font-size:12px; font-weight:600;">Amount Paid</td>
                                        <td style="text-align:right; color:#fff; font-size:18px; font-weight:800;">₹%s</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Quick Tip -->
                        <div style="background:#fff9f0; border-left:3px solid #f59e0b; padding:10px 12px; border-radius:6px; margin-bottom:16px;">
                            <div style="color:#92400e; font-size:12px; font-weight:600; margin-bottom:3px;">💡 Quick Tip</div>
                            <div style="color:#78350f; font-size:11px; line-height:1.4;">Arrive 5 mins early with a valid ID</div>
                        </div>
                        
                        <!-- Thank You -->
                        <div style="text-align:center;">
                            <p style="margin:0 0 3px 0; color:#6b7280; font-size:12px;">Thank you for choosing us! 💖</p>
                            <p style="margin:0; color:#1f2937; font-size:13px; font-weight:700;">— Hair&Beauty Team</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background:#fafaf9; padding:12px 16px; text-align:center; border-top:1px solid rgba(143,106,59,0.08);">
                        <p style="margin:0 0 6px 0; color:#9ca3af; font-size:11px;">📍 123 Beauty St, City 400001</p>
                        <p style="margin:0 0 10px 0; color:#9ca3af; font-size:11px;">📞 +91 98765 43210</p>
                        
                        <div style="margin-bottom:8px;">
                            <a href="#" style="display:inline-block; width:28px; height:28px; background:#8f6a3b; color:#fff; border-radius:50%%; margin:0 3px; text-decoration:none; line-height:28px; font-size:12px;">📘</a>
                            <a href="#" style="display:inline-block; width:28px; height:28px; background:#8f6a3b; color:#fff; border-radius:50%%; margin:0 3px; text-decoration:none; line-height:28px; font-size:12px;">📷</a>
                            <a href="#" style="display:inline-block; width:28px; height:28px; background:#8f6a3b; color:#fff; border-radius:50%%; margin:0 3px; text-decoration:none; line-height:28px; font-size:12px;">🐦</a>
                        </div>
                        
                        <p style="margin:0; color:#9ca3af; font-size:10px;">© 2025 Hair&Beauty</p>
                    </div>
                    
                </div>
                
            </div>
            
        </body>
        </html>
        """.formatted(
                a.getName(),
                a.getService(),
                a.getDate(),
                a.getTime(),
                a.getService().equals("Hair Colouring") ? "1000" :
                        a.getService().equals("Hair Spa") ? "800" : "500"
        );
    }
}