package com.stylebook.service;

import com.stylebook.dto.PromoDTO;
import com.stylebook.entity.Promo;
import com.stylebook.entity.Shop;
import com.stylebook.entity.User;
import com.stylebook.repository.PromoRepository;
import com.stylebook.repository.ShopRepository;
import com.stylebook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromoService {

    private final PromoRepository promoRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    @Transactional
    public PromoDTO.PromoResponse create(UUID ownerId, PromoDTO.CreatePromoRequest request) {
        Shop shop = ownerShop(ownerId);
        if (shop.getPlan() == Shop.SubscriptionPlan.FREE) {
            throw new RuntimeException(
                "Promo offers are available on Pro and Enterprise plans. Upgrade in Settings to start posting promos.");
        }
        if (request.getImageUrl() == null || request.getImageUrl().isEmpty()) {
            throw new RuntimeException("A promo picture is required");
        }
        if (request.getDetails() == null || request.getDetails().trim().isEmpty()) {
            throw new RuntimeException("Please describe your promo offer");
        }
        Promo promo = Promo.builder()
                .shop(shop)
                .imageUrl(request.getImageUrl())
                .details(request.getDetails().trim())
                .build();
        promoRepository.save(promo);
        return PromoDTO.PromoResponse.from(promo);
    }

    public List<PromoDTO.PromoResponse> getAll() {
        return promoRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p -> p.getShop().isActive())
                .filter(p -> p.getShop().getPlan() != Shop.SubscriptionPlan.FREE)
                .map(PromoDTO.PromoResponse::from)
                .collect(Collectors.toList());
    }

    public List<PromoDTO.PromoResponse> getMine(UUID ownerId) {
        Shop shop = ownerShop(ownerId);
        return promoRepository.findByShopOrderByCreatedAtDesc(shop).stream()
                .map(PromoDTO.PromoResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(UUID ownerId, UUID promoId) {
        Shop shop = ownerShop(ownerId);
        Promo promo = promoRepository.findById(promoId)
                .orElseThrow(() -> new RuntimeException("Promo not found"));
        if (!promo.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        promoRepository.delete(promo);
    }

    private Shop ownerShop(UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
    }
}
