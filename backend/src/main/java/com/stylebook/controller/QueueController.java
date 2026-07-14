package com.stylebook.controller;
import com.stylebook.dto.QueueDTO;
import com.stylebook.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {
    private final QueueService queueService;
    @PostMapping("/join")
    public ResponseEntity<QueueDTO.EntryResponse> join(
            @RequestBody QueueDTO.JoinRequest request,
            Authentication authentication) {
        UUID customerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(queueService.join(customerId, request));
    }
    @GetMapping("/my")
    public ResponseEntity<QueueDTO.EntryResponse> getMyEntry(Authentication authentication) {
        UUID customerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(queueService.getMyEntry(customerId));
    }
    @PutMapping("/{entryId}/leave")
    public ResponseEntity<Void> leave(
            @PathVariable UUID entryId,
            Authentication authentication) {
        UUID customerId = (UUID) authentication.getPrincipal();
        queueService.leave(customerId, entryId);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/shop/{shopId}/summary")
    public ResponseEntity<QueueDTO.QueueSummary> getShopQueueSummary(@PathVariable UUID shopId) {
        return ResponseEntity.ok(queueService.getShopQueueSummary(shopId));
    }
    @GetMapping("/shop")
    public ResponseEntity<List<QueueDTO.EntryResponse>> getShopQueue(Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(queueService.getShopQueue(ownerId));
    }
    @PutMapping("/{entryId}/call")
    public ResponseEntity<QueueDTO.EntryResponse> call(
            @PathVariable UUID entryId,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(queueService.call(ownerId, entryId));
    }
    @PutMapping("/{entryId}/complete")
    public ResponseEntity<QueueDTO.EntryResponse> complete(
            @PathVariable UUID entryId,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(queueService.complete(ownerId, entryId));
    }
    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> remove(
            @PathVariable UUID entryId,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        queueService.remove(ownerId, entryId);
        return ResponseEntity.ok().build();
    }
}