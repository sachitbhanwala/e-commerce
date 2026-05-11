package com.vivriti.ecommerce.service;

import java.util.List;
import java.util.Optional;

import com.vivriti.ecommerce.dto.ProductDto;

public interface ProductService {
    List<ProductDto> getAllProducts();

    Optional<ProductDto> getProductById(Long id);

    Optional<ProductDto> getProductByProductId(String productId);

    ProductDto addProduct(ProductDto productDto);

    Optional<ProductDto> updateProduct(Long id, ProductDto productDto);

    boolean deleteProduct(Long id);

    List<ProductDto> getRecommendedProducts(Long id);

    List<ProductDto> getRecommendedOnlyProducts();

    List<ProductDto> searchProducts(String query);
}
