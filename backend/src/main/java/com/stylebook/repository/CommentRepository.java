package com.stylebook.repository;

import com.stylebook.entity.Comment;
import com.stylebook.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    List<Comment> findByPostOrderByCreatedAtAsc(Post post);

    void deleteByPostId(UUID postId);
}