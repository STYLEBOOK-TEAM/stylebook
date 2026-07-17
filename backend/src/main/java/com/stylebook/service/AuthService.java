package com.stylebook.service;

import com.stylebook.dto.AuthDTO.*;
import com.stylebook.entity.Shop;
import com.stylebook.entity.User;
import com.stylebook.repository.ShopRepository;
import com.stylebook.repository.UserRepository;
import com.stylebook.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @Transactional
    public AuthResponse registerCustomer(CustomerRegisterRequest request) {
        User existing = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (existing != null) {
            if (!existing.isEmailVerified() && existing.getRole() == User.UserRole.CUSTOMER) {
                // Unverified account: let them re-register (update details, fresh code)
                existing.setFullName(request.getFullName());
                existing.setPhone(request.getPhone());
                existing.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(existing);
                issueOtp(existing);
                String tk = jwtUtils.generateToken(existing.getId(), existing.getEmail(),
                        existing.getRole().name());
                return new AuthResponse(tk, existing, null);
            }
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.CUSTOMER)
                .emailVerified(false)
                .build();

        userRepository.save(user);
        issueOtp(user);

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(),
                user.getRole().name());
        return new AuthResponse(token, user, null);
    }

    @Transactional
    public AuthResponse registerOwner(OwnerRegisterRequest request) {
        User existingOwner = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (existingOwner != null) {
            if (!existingOwner.isEmailVerified() && existingOwner.getRole() == User.UserRole.OWNER) {
                existingOwner.setFullName(request.getFullName());
                existingOwner.setPhone(request.getPhone());
                existingOwner.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(existingOwner);
                issueOtp(existingOwner);
                String tk = jwtUtils.generateToken(existingOwner.getId(), existingOwner.getEmail(),
                        existingOwner.getRole().name());
                String existingShopId = shopRepository.findByOwner(existingOwner)
                        .stream().findFirst()
                        .map(sh -> sh.getId().toString()).orElse(null);
                return new AuthResponse(tk, existingOwner, existingShopId);
            }
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.OWNER)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        Shop shop = Shop.builder()
                .owner(user)
                .name(request.getShopName())
                .category(request.getCategory() != null ?
                        request.getCategory() : Shop.ShopCategory.SALON)
                .city(request.getCity())
                .googleMapsLink(request.getGoogleMapsLink())
                .plan(request.getPlan() != null ?
                        request.getPlan() : Shop.SubscriptionPlan.FREE)
                .isActive(true)
                .avgRating(0.0)
                .reviewCount(0)
                .build();

        shopRepository.save(shop);
        issueOtp(user);

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(),
                user.getRole().name());
        return new AuthResponse(token, user, shop.getId().toString());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            issueOtp(user);
            throw new RuntimeException("EMAIL_NOT_VERIFIED");
        }

        String shopId = null;
        if (user.getRole() == User.UserRole.OWNER) {
            shopId = shopRepository.findByOwner(user)
                    .stream()
                    .findFirst()
                    .map(shop -> shop.getId().toString())
                    .orElse(null);
        }

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(),
                user.getRole().name());
        return new AuthResponse(token, user, shopId);
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (user.isEmailVerified()) {
            // already verified — just log them in
        } else {
            if (user.getEmailVerificationToken() == null ||
                user.getEmailVerificationTokenExpiry() == null ||
                user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Code has expired. Tap 'Resend code' to get a new one.");
            }
            if (!user.getEmailVerificationToken().equals(request.getCode().trim())) {
                throw new RuntimeException("Wrong code. Check your email and try again.");
            }
            user.setEmailVerified(true);
            user.setEmailVerificationToken(null);
            user.setEmailVerificationTokenExpiry(null);
            userRepository.save(user);
        }

        String shopId = null;
        if (user.getRole() == User.UserRole.OWNER) {
            shopId = shopRepository.findByOwner(user)
                    .stream()
                    .findFirst()
                    .map(shop -> shop.getId().toString())
                    .orElse(null);
        }

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(),
                user.getRole().name());
        return new AuthResponse(token, user, shopId);
    }

    @Transactional
    public MessageResponse resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("This email is already verified. Just sign in.");
        }

        issueOtp(user);
        return new MessageResponse("A new code has been sent to " + user.getEmail());
    }

    private void issueOtp(User user) {
        String code = String.format("%06d", new SecureRandom().nextInt(1000000));
        user.setEmailVerificationToken(code);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Console fallback so a demo never gets stuck if email isn't configured
        System.out.println("========================================");
        System.out.println("[StyleBook OTP] " + user.getEmail() + " -> " + code);
        System.out.println("========================================");

        try {
            emailService.sendOtpEmail(user, code);
        } catch (Exception e) {
            System.out.println("[StyleBook OTP] Email sending failed (" + e.getMessage()
                    + ") — use the code printed above.");
        }
    }
}