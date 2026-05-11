package com.vivriti.ecommerce.service;

import com.vivriti.ecommerce.dto.ReviewDto;
import com.vivriti.ecommerce.dto.ReviewRequest;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.model.Product;
import com.vivriti.ecommerce.model.Review;
import com.vivriti.ecommerce.repository.ProductRepository;
import com.vivriti.ecommerce.repository.ReviewRepository;
import com.vivriti.ecommerce.repository.ReviewRepository.AverageRatingProjection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductId(productId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public double getProductAverageRating(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        return reviews.stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);
    }

    public Map<Long, Double> getAverageRatings(List<Long> productIds) {
        Map<Long, Double> ratings = new HashMap<>();
        if (productIds == null || productIds.isEmpty()) {
            return ratings;
        }

        for (Long productId : productIds) {
            ratings.put(productId, 0.0);
        }

        List<AverageRatingProjection> averages = reviewRepository.findAverageRatingsByProductIds(productIds);
        for (AverageRatingProjection average : averages) {
            Double value = average.getAverageRating();
            ratings.put(average.getProductId(), value != null ? value : 0.0);
        }

        return ratings;
    }

    public ReviewDto addReview(Long productId, AppUser user, ReviewRequest request) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Always create a new review - users can add multiple reviews
        Review review = new Review(product, user, request.getRating(), request.getComment());
        Review savedReview = reviewRepository.save(review);
        return convertToDto(savedReview);
    }

    public ReviewDto updateReview(Long reviewId, AppUser user, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only update your own review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        Review savedReview = reviewRepository.save(review);
        return convertToDto(savedReview);
    }

    public void deleteReview(Long reviewId, AppUser user) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own review");
        }

        reviewRepository.deleteById(reviewId);
    }

    private ReviewDto convertToDto(Review review) {
        return new ReviewDto(
            review.getId(),
            review.getProduct().getId(),
            review.getUser().getName(),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt()
        );
    }
}
