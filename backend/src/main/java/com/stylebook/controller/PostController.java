package com.stylebook.controller;

import com.stylebook.dto.PostDTO;
import com.stylebook.service.FileUploadService;
import com.stylebook.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final FileUploadService fileUploadService;

    @GetMapping("/feed")
    public ResponseEntity<List<PostDTO.PostResponse>> getFeed(
            Authentication authentication) {
        UUID currentUserId = authentication != null ?
                (UUID) authentication.getPrincipal() : null;
        return ResponseEntity.ok(postService.getFeed(currentUserId));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<PostDTO.PostResponse>> getTrendingPosts(
            Authentication authentication) {
        UUID currentUserId = authentication != null ?
                (UUID) authentication.getPrincipal() : null;
        return ResponseEntity.ok(postService.getTrendingPosts(currentUserId));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<PostDTO.PostResponse>> getShopPosts(
            @PathVariable UUID shopId,
            Authentication authentication) {
        UUID currentUserId = authentication != null ?
                (UUID) authentication.getPrincipal() : null;
        return ResponseEntity.ok(postService.getShopPosts(shopId, currentUserId));
    }

    @PostMapping
    public ResponseEntity<PostDTO.PostResponse> createPost(
            @RequestBody PostDTO.CreatePostRequest request,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(postService.createPost(ownerId, request));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadPostImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        String imageUrl = fileUploadService.uploadFile(file);
        return ResponseEntity.ok(imageUrl);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<PostDTO.PostResponse> toggleLike(
            @PathVariable UUID postId,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(postService.toggleLike(userId, postId));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<PostDTO.CommentResponse> addComment(
            @PathVariable UUID postId,
            @RequestBody PostDTO.CommentRequest request,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(postService.addComment(userId, postId, request));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<PostDTO.CommentResponse>> getComments(
            @PathVariable UUID postId) {
        return ResponseEntity.ok(postService.getComments(postId));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID postId,
            Authentication authentication) {
        UUID ownerId = (UUID) authentication.getPrincipal();
        postService.deletePost(ownerId, postId);
        return ResponseEntity.ok().build();
    }
}