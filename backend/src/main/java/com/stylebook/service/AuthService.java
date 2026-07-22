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
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.CUSTOMER)
                .emailVerified(true)
                .build();

        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(),
                user.getRole().name());
        return new AuthResponse(token, user, null);
    }

    @Transactional
    public AuthResponse registerOwner(OwnerRegisterRequest request) {
        User existingOwner = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (existingOwner != null) {
            throw new RuntimeException("Email already in use");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.OWNER)
                .emailVerified(true)
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

        return new MessageResponse("Your account is already verified.");
    }
}