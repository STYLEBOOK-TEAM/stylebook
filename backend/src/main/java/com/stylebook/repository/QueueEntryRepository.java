package com.stylebook.repository;
import com.stylebook.entity.QueueEntry;
import com.stylebook.entity.Shop;
import com.stylebook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, UUID> {
    List<QueueEntry> findByShopAndStatusInOrderByJoinedAtAsc(
            Shop shop, List<QueueEntry.QueueStatus> statuses);
    Optional<QueueEntry> findFirstByCustomerAndStatusInOrderByJoinedAtDesc(
            User customer, List<QueueEntry.QueueStatus> statuses);
}