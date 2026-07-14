package com.stylebook.dto;

import com.stylebook.entity.Comment;
import com.stylebook.entity.Post;
import lombok.Data;

import java.util.List;

public class PostDTO {

    @Data
    public static class CreatePostRequest {
        private String caption;
        private String imageUrl;
    }

    @Data
    public static class PostResponse {
        private String id;
        private String shopId;
        private String shopName;
        private String shopCoverImage;
        private String shopCategory;
        private String imageUrl;
        private String caption;
        private Integer likeCount;
        private Integer commentCount;
        private boolean likedByMe;
        private String createdAt;
        private List<CommentResponse> recentComments;

        public static PostResponse from(Post post) {
            PostResponse response = new PostResponse();
            response.setId(post.getId().toString());
            response.setShopId(post.getShop().getId().toString());
            response.setShopName(post.getShop().getName());
            response.setShopCoverImage(post.getShop().getCoverImageUrl());
            response.setShopCategory(post.getShop().getCategory().name());
            response.setImageUrl(post.getImageUrl());
            response.setCaption(post.getCaption());
            response.setLikeCount(post.getLikeCount() != null ? post.getLikeCount() : 0);
            response.setCommentCount(
                post.getComments() != null ? post.getComments().size() : 0
            );
            response.setCreatedAt(post.getCreatedAt() != null ?
                    post.getCreatedAt().toString() : "");
            return response;
        }
    }

    @Data
    public static class CommentRequest {
        private String content;
    }

    @Data
    public static class CommentResponse {
        private String id;
        private String userId;
        private String userName;
        private String content;
        private String createdAt;

        public static CommentResponse from(Comment comment) {
            CommentResponse response = new CommentResponse();
            response.setId(comment.getId().toString());
            response.setUserId(comment.getUser().getId().toString());
            response.setUserName(comment.getUser().getFullName());
            response.setContent(comment.getContent());
            response.setCreatedAt(comment.getCreatedAt() != null ?
                    comment.getCreatedAt().toString() : "");
            return response;
        }
    }
}