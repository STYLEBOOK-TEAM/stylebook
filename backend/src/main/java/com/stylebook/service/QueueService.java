package com.stylebook.service;
import com.stylebook.dto.QueueDTO;
import com.stylebook.entity.QueueEntry;
import com.stylebook.entity.Shop;
import com.stylebook.entity.User;
import com.stylebook.repository.QueueEntryRepository;
import com.stylebook.repository.ServiceRepository;
import com.stylebook.repository.ShopRepository;
import com.stylebook.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class QueueService {
    private static final int DEFAULT_DURATION_MINUTES = 30;
    private static final List<QueueEntry.QueueStatus> ACTIVE_STATUSES =
            List.of(QueueEntry.QueueStatus.WAITING, QueueEntry.QueueStatus.IN_SERVICE);
    private final QueueEntryRepository queueEntryRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    @Transactional
    public QueueDTO.EntryResponse join(UUID customerId, QueueDTO.JoinRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (queueEntryRepository
                .findFirstByCustomerAndStatusInOrderByJoinedAtDesc(customer, ACTIVE_STATUSES)
                .isPresent()) {
            throw new RuntimeException("You are already in a queue. Leave it first to join another.");
        }
        Shop shop = shopRepository.findById(UUID.fromString(request.getShopId()))
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        com.stylebook.entity.Service service = null;
        if (request.getServiceId() != null && !request.getServiceId().isEmpty()) {
            service = serviceRepository.findById(UUID.fromString(request.getServiceId()))
                    .orElseThrow(() -> new RuntimeException("Service not found"));
            if (!service.getShop().getId().equals(shop.getId())) {
                throw new RuntimeException("Service does not belong to this shop");
            }
        }
        QueueEntry entry = QueueEntry.builder()
                .shop(shop)
                .customer(customer)
                .service(service)
                .status(QueueEntry.QueueStatus.WAITING)
                .build();
        queueEntryRepository.save(entry);
        return withPosition(entry);
    }
    public QueueDTO.EntryResponse getMyEntry(UUID customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return queueEntryRepository
                .findFirstByCustomerAndStatusInOrderByJoinedAtDesc(customer, ACTIVE_STATUSES)
                .map(this::withPosition)
                .orElse(null);
    }
    @Transactional
    public void leave(UUID customerId, UUID entryId) {
        QueueEntry entry = queueEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Queue entry not found"));
        if (!entry.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Unauthorized");
        }
        entry.setStatus(QueueEntry.QueueStatus.CANCELLED);
        queueEntryRepository.save(entry);
    }
    public List<QueueDTO.EntryResponse> getShopQueue(UUID ownerId) {
        Shop shop = getOwnerShop(ownerId);
        return activeEntries(shop).stream()
                .map(this::withPosition)
                .collect(Collectors.toList());
    }
    public QueueDTO.QueueSummary getShopQueueSummary(UUID shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        List<QueueEntry> waiting = activeEntries(shop).stream()
                .filter(e -> e.getStatus() == QueueEntry.QueueStatus.WAITING)
                .collect(Collectors.toList());
        QueueDTO.QueueSummary summary = new QueueDTO.QueueSummary();
        summary.setWaitingCount(waiting.size());
        summary.setEstimatedWaitMinutes(waiting.stream().mapToInt(this::durationOf).sum());
        return summary;
    }
    @Transactional
    public QueueDTO.EntryResponse call(UUID ownerId, UUID entryId) {
        QueueEntry entry = ownedEntry(ownerId, entryId);
        entry.setStatus(QueueEntry.QueueStatus.IN_SERVICE);
        entry.setCalledAt(LocalDateTime.now());
        queueEntryRepository.save(entry);
        return withPosition(entry);
    }
    @Transactional
    public QueueDTO.EntryResponse complete(UUID ownerId, UUID entryId) {
        QueueEntry entry = ownedEntry(ownerId, entryId);
        entry.setStatus(QueueEntry.QueueStatus.COMPLETED);
        entry.setCompletedAt(LocalDateTime.now());
        queueEntryRepository.save(entry);
        return withPosition(entry);
    }
    @Transactional
    public void remove(UUID ownerId, UUID entryId) {
        QueueEntry entry = ownedEntry(ownerId, entryId);
        entry.setStatus(QueueEntry.QueueStatus.CANCELLED);
        queueEntryRepository.save(entry);
    }
    private Shop getOwnerShop(UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return shopRepository.findByOwnerAndIsActiveTrue(owner)
                .orElseThrow(() -> new RuntimeException("Shop not found"));
    }
    private QueueEntry ownedEntry(UUID ownerId, UUID entryId) {
        Shop shop = getOwnerShop(ownerId);
        QueueEntry entry = queueEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Queue entry not found"));
        if (!entry.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        return entry;
    }
    private List<QueueEntry> activeEntries(Shop shop) {
        return queueEntryRepository.findByShopAndStatusInOrderByJoinedAtAsc(shop, ACTIVE_STATUSES);
    }
    private int durationOf(QueueEntry entry) {
        return entry.getService() != null && entry.getService().getDurationMinutes() != null
                ? entry.getService().getDurationMinutes()
                : DEFAULT_DURATION_MINUTES;
    }
    private QueueDTO.EntryResponse withPosition(QueueEntry entry) {
        QueueDTO.EntryResponse response = QueueDTO.EntryResponse.from(entry);
        if (entry.getStatus() == QueueEntry.QueueStatus.WAITING) {
            List<QueueEntry> waiting = activeEntries(entry.getShop()).stream()
                    .filter(e -> e.getStatus() == QueueEntry.QueueStatus.WAITING)
                    .collect(Collectors.toList());
            int position = 0;
            int waitMinutes = 0;
            for (QueueEntry e : waiting) {
                position++;
                if (e.getId().equals(entry.getId())) break;
                waitMinutes += durationOf(e);
            }
            response.setPosition(position);
            response.setEstimatedWaitMinutes(waitMinutes);
        } else if (entry.getStatus() == QueueEntry.QueueStatus.IN_SERVICE) {
            response.setPosition(0);
            response.setEstimatedWaitMinutes(0);
        }
        return response;
    }
}