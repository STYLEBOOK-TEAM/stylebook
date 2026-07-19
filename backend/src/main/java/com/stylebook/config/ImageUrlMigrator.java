package com.stylebook.config;

import com.stylebook.entity.*;
import com.stylebook.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-shot self-healing: rewrites any image URL still pointing at an old
 * local address (WiFi IP / localhost) to the current public base URL.
 * Runs before the demo seeder and is idempotent.
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class ImageUrlMigrator implements CommandLineRunner {

    private static final String[] OLD_PREFIXES = {
        "http://10.192.1.15:8080",
        "http://localhost:8080",
    };

    private final ShopRepository shopRepository;
    private final ShopPhotoRepository shopPhotoRepository;
    private final PostRepository postRepository;
    private final PromoRepository promoRepository;

    @Value("${stylebook.app.base-url}")
    private String baseUrl;

    @Override
    @Transactional
    public void run(String... args) {
        int fixed = 0;
        for (Shop shop : shopRepository.findAll()) {
            String updated = migrate(shop.getCoverImageUrl());
            if (updated != null) {
                shop.setCoverImageUrl(updated);
                shopRepository.save(shop);
                fixed++;
            }
        }
        for (ShopPhoto photo : shopPhotoRepository.findAll()) {
            String updated = migrate(photo.getImageUrl());
            if (updated != null) {
                photo.setImageUrl(updated);
                shopPhotoRepository.save(photo);
                fixed++;
            }
        }
        for (Post post : postRepository.findAll()) {
            String updated = migrate(post.getImageUrl());
            if (updated != null) {
                post.setImageUrl(updated);
                postRepository.save(post);
                fixed++;
            }
        }
        for (Promo promo : promoRepository.findAll()) {
            String updated = migrate(promo.getImageUrl());
            if (updated != null) {
                promo.setImageUrl(updated);
                promoRepository.save(promo);
                fixed++;
            }
        }
        if (fixed > 0) {
            System.out.println("[ImageUrls] Rewrote " + fixed + " old image links to " + baseUrl);
        }
    }

    private String migrate(String url) {
        if (url == null) return null;
        for (String prefix : OLD_PREFIXES) {
            if (url.startsWith(prefix)) {
                return baseUrl + url.substring(prefix.length());
            }
        }
        return null;
    }
}
