package com.vivriti.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vivriti.ecommerce.model.Product;
import com.vivriti.ecommerce.model.ProductCategory;

public interface ProductRepository extends JpaRepository<Product, Long> {
	Optional<Product> findByProductId(String productId);

	List<Product> findByProductIdIsNullOrProductId(String productId);

	List<Product> findByRecommendedOnlyFalse();

	List<Product> findByRecommendedOnlyTrue();

	List<Product> findTop10ByCategoryAndIdNotAndRecommendedOnlyTrue(ProductCategory category, Long id);

	List<Product> findTop10ByCategoryAndIdNotAndRecommendedOnlyFalse(ProductCategory category, Long id);

	List<Product> findTop10ByRecommendedOnlyTrueOrderByIdDesc();

	List<Product> findTop10ByRecommendedOnlyFalseOrderByIdDesc();

	List<Product> findByNameContainingIgnoreCase(String name);

	List<Product> findByShortDescriptionContainingIgnoreCase(String description);
}
