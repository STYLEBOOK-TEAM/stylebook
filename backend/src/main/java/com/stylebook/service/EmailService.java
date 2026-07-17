package com.stylebook.service;

import com.stylebook.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${stylebook.app.base-url}")
    private String baseUrl;

    @Value("${stylebook.app.name}")
    private String appName;

    public void sendOtpEmail(User user, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject(appName + " - Your verification code");
        message.setText(
            "Hi " + user.getFullName() + ",\n\n" +
            "Your " + appName + " verification code is:\n\n" +
            "    " + code + "\n\n" +
            "It expires in 10 minutes.\n\n" +
            "If you did not create an account, please ignore this email.\n\n" +
            "The StyleBook Team"
        );
        mailSender.send(message);
    }

    public void sendVerificationEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject(appName + " - Verify Your Email");
        message.setText(
            "Hi " + user.getFullName() + ",\n\n" +
            "Welcome to StyleBook! Please verify your email address by clicking the link below:\n\n" +
            baseUrl + "/api/auth/verify-email?token=" + user.getEmailVerificationToken() + "\n\n" +
            "This link expires in 24 hours.\n\n" +
            "If you did not create an account, please ignore this email.\n\n" +
            "The StyleBook Team"
        );
        mailSender.send(message);
    }

    public void sendBookingConfirmationEmail(String toEmail, String customerName,
                                              String shopName, String serviceName,
                                              String date, String time) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(appName + " - Booking Confirmed!");
        message.setText(
            "Hi " + customerName + ",\n\n" +
            "Your booking has been confirmed!\n\n" +
            "Shop: " + shopName + "\n" +
            "Service: " + serviceName + "\n" +
            "Date: " + date + "\n" +
            "Time: " + time + "\n\n" +
            "We look forward to seeing you!\n\n" +
            "The StyleBook Team"
        );
        mailSender.send(message);
    }

    public void sendBookingCancellationEmail(String toEmail, String customerName,
                                              String shopName, String date, String time) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(appName + " - Booking Cancelled");
        message.setText(
            "Hi " + customerName + ",\n\n" +
            "Your booking at " + shopName + " on " + date + " at " + time +
            " has been cancelled.\n\n" +
            "You can rebook anytime through the StyleBook app.\n\n" +
            "The StyleBook Team"
        );
        mailSender.send(message);
    }
}