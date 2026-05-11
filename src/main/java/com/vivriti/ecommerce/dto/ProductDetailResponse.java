package com.vivriti.ecommerce.dto;

import java.util.List;

public class ProductDetailResponse {
    private ProductDto product;
    private List<ReviewDto> reviews;
    private Double averageRating;
    private Boolean isWishlisted;

    public ProductDetailResponse(ProductDto product, List<ReviewDto> reviews, Double averageRating,
            Boolean isWishlisted) {
        this.product = product;
        this.reviews = reviews;
        this.averageRating = averageRating;
        this.isWishlisted = isWishlisted;
    }

    public ProductDto getProduct() {
        return product;
    }

    public void setProduct(ProductDto product) {
        this.product = product;
    }

    public List<ReviewDto> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewDto> reviews) {
        this.reviews = reviews;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Boolean getIsWishlisted() {
        return isWishlisted;
    }

    public void setIsWishlisted(Boolean isWishlisted) {
        this.isWishlisted = isWishlisted;
    }
}
