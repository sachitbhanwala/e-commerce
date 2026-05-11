package com.vivriti.ecommerce.service;

import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.vivriti.ecommerce.dto.ProductDto;
import com.vivriti.ecommerce.mapper.ProductMapper;
import com.vivriti.ecommerce.model.Product;
import com.vivriti.ecommerce.model.ProductCategory;
import com.vivriti.ecommerce.repository.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(
            ProductRepository productRepository,
            ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Override
    @Cacheable(value = "products")
    public List<ProductDto> getAllProducts() {
        return productMapper.toDtoList(productRepository.findByRecommendedOnlyFalse());
    }

    @Override
    @Cacheable(value = "productDetails", key = "#id")
    public Optional<ProductDto> getProductById(Long id) {
        return productRepository.findById(id).map(productMapper::toDto);
    }

    @Override
    public Optional<ProductDto> getProductByProductId(String productId) {
        return productRepository.findByProductId(productId).map(productMapper::toDto);
    }

    @Override
    @CacheEvict(value = {"products", "recommendedProducts", "productDetails"}, allEntries = true)
    public ProductDto addProduct(ProductDto productDto) {
        if (productDto.getCategory() == null) {
            productDto.setCategory(ProductCategory.GENERAL);
        }

        productDto.setId(null);
        productDto.setProductId(UUID.randomUUID().toString());
        productDto.setProductToken(UUID.randomUUID().toString());
        Product savedProduct = productRepository.save(productMapper.toEntity(productDto));
        return productMapper.toDto(savedProduct);
    }

    @Override
    @CacheEvict(value = {"products", "recommendedProducts", "productDetails"}, allEntries = true)
    public Optional<ProductDto> updateProduct(Long id, ProductDto productDto) {
        return productRepository.findById(id)
                .map(existing -> {
                    if (productDto.getCategory() == null) {
                        productDto.setCategory(ProductCategory.GENERAL);
                    }

                    existing.setName(productDto.getName());
                    existing.setImage(productDto.getImage());
                    existing.setCategory(productDto.getCategory());
                    existing.setShortDescription(productDto.getShortDescription());
                    existing.setFullDescription(productDto.getFullDescription());
                    existing.setPrice(productDto.getPrice());
                    existing.setRecommendedOnly(productDto.isRecommendedOnly());
                    if (productDto.getImageUrls() != null) {
                        existing.setImageUrls(new ArrayList<>(productDto.getImageUrls()));
                    }

                    Product saved = productRepository.save(existing);
                    return productMapper.toDto(saved);
                });
    }

    @Override
    @CacheEvict(value = {"products", "recommendedProducts", "productDetails"}, allEntries = true)
    public boolean deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            return false;
        }

        productRepository.deleteById(id);
        return true;
    }

    @Override
    @Cacheable(value = "recommendedProducts", key = "#id")
    public List<ProductDto> getRecommendedProducts(Long id) {
        int limit = 10;
        Optional<Product> currentProduct = productRepository.findById(id);
        if (currentProduct.isEmpty()) {
            return List.of();
        }

        ProductCategory category = currentProduct.get().getCategory();
        List<ProductDto> results = new ArrayList<>();
        Set<Long> seen = new HashSet<>();

        addProductsByCategory(productRepository.findTop10ByCategoryAndIdNotAndRecommendedOnlyTrue(category, id),
                id, results, seen, limit);
        addProductsByCategory(productRepository.findTop10ByCategoryAndIdNotAndRecommendedOnlyFalse(category, id),
                id, results, seen, limit);

        if (results.size() < limit) {
            addProductsByCategory(productRepository.findTop10ByRecommendedOnlyTrueOrderByIdDesc(),
                    id, results, seen, limit);
        }

        if (results.size() < limit) {
            addProductsByCategory(productRepository.findTop10ByRecommendedOnlyFalseOrderByIdDesc(),
                    id, results, seen, limit);
        }

        return results;
    }

    @Override
    @Cacheable(value = "recommendedProducts")
    public List<ProductDto> getRecommendedOnlyProducts() {
        return productMapper.toDtoList(productRepository.findByRecommendedOnlyTrue());
    }

    @Override
    public List<ProductDto> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        String searchTerm = query.toLowerCase().trim();
        List<Product> results = new ArrayList<>();
        Set<Long> seen = new HashSet<>();

        // Search by name
        for (Product p : productRepository.findByNameContainingIgnoreCase(searchTerm)) {
            if (seen.add(p.getId())) {
                results.add(p);
            }
        }

        // Search by description
        for (Product p : productRepository.findByShortDescriptionContainingIgnoreCase(searchTerm)) {
            if (seen.add(p.getId())) {
                results.add(p);
            }
        }

        return productMapper.toDtoList(results);
    }

    private void addProductsByCategory(
            List<Product> products,
            Long currentId,
            List<ProductDto> results,
            Set<Long> seen,
            int limit) {
        for (Product item : products) {
            if (results.size() >= limit) {
                return;
            }
            if (item.getId().equals(currentId)) {
                continue;
            }
            if (seen.add(item.getId())) {
                results.add(productMapper.toDto(item));
            }
        }
    }
}
