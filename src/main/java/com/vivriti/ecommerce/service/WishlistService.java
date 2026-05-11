package com.vivriti.ecommerce.service;

import com.vivriti.ecommerce.dto.ProductDto;
import com.vivriti.ecommerce.mapper.ProductMapper;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.model.Product;
import com.vivriti.ecommerce.model.Wishlist;
import com.vivriti.ecommerce.repository.ProductRepository;
import com.vivriti.ecommerce.repository.WishlistRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public WishlistService(
        WishlistRepository wishlistRepository,
        ProductRepository productRepository,
        ProductMapper productMapper
    ) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public List<ProductDto> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
            .stream()
            .map(Wishlist::getProduct)
            .map(productMapper::toDto)
            .collect(Collectors.toList());
    }

    public void addToWishlist(Long productId, AppUser user) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new IllegalArgumentException("Product already in wishlist");
        }

        Wishlist wishlist = new Wishlist(user, product);
        wishlistRepository.save(wishlist);
    }

    public void removeFromWishlist(Long productId, AppUser user) {
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    public boolean isInWishlist(Long productId, AppUser user) {
        return wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
    }
}
