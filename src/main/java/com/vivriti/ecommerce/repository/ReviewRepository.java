package com.vivriti.ecommerce.repository;

import com.vivriti.ecommerce.model.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);

    @Query("select r.product.id as productId, avg(r.rating) as averageRating "
        + "from Review r where r.product.id in :productIds group by r.product.id")
    List<AverageRatingProjection> findAverageRatingsByProductIds(@Param("productIds") List<Long> productIds);

    interface AverageRatingProjection {
        Long getProductId();
        Double getAverageRating();
    }
}
