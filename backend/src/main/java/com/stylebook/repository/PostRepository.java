package com.stylebook.repository;

import com.stylebook.entity.Post;
import com.stylebook.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    List<Post> findByShopOrderByCreatedAtDesc(Shop shop);

    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllOrderByCreatedAtDesc();

    @Query("SELECT COUNT(p) FROM Post p WHERE p.shop = :shop")
    Long countByShop(@Param("shop") Shop shop);

    @Query("SELECT p FROM Post p ORDER BY p.likeCount DESC, p.createdAt DESC")
    List<Post> findTrendingPosts();
}