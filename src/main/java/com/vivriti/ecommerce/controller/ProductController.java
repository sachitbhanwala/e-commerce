package com.vivriti.ecommerce.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import com.vivriti.ecommerce.dto.ProductDto;
import com.vivriti.ecommerce.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.DELETE })
public class ProductController {
    private final ProductService productService;
    private final com.vivriti.ecommerce.service.ReviewService reviewService;
    private final com.vivriti.ecommerce.service.WishlistService wishlistService;

    public ProductController(ProductService productService,
            com.vivriti.ecommerce.service.ReviewService reviewService,
            com.vivriti.ecommerce.service.WishlistService wishlistService) {
        this.productService = productService;
        this.reviewService = reviewService;
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<ProductDto> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<com.vivriti.ecommerce.dto.ProductDetailResponse> getProductDetails(
            @PathVariable Long id,
            org.springframework.security.core.Authentication authentication) {

        java.util.Optional<ProductDto> productOpt = productService.getProductById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ProductDto product = productOpt.get();

        List<com.vivriti.ecommerce.dto.ReviewDto> reviews = reviewService.getProductReviews(id);
        Double averageRating = reviewService.getProductAverageRating(id);

        boolean isWishlisted = false;
        if (authentication != null
                && authentication.getPrincipal() instanceof com.vivriti.ecommerce.model.AppUser user) {
            isWishlisted = wishlistService.isInWishlist(id, user);
        }

        return ResponseEntity.ok(new com.vivriti.ecommerce.dto.ProductDetailResponse(
                product, reviews, averageRating, isWishlisted));
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<ProductDto>> getRecommendations(@PathVariable Long id) {
        if (productService.getProductById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(productService.getRecommendedProducts(id));
    }

    @GetMapping("/recommended-only")
    public List<ProductDto> getRecommendedOnlyProducts() {
        return productService.getRecommendedOnlyProducts();
    }

    @GetMapping("/search")
    public List<ProductDto> searchProducts(@RequestParam String q) {
        return productService.searchProducts(q);
    }

    @GetMapping("/by-product-id/{productId}")
    public ResponseEntity<ProductDto> getProductByProductId(@PathVariable String productId) {
        return productService.getProductByProductId(productId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> addProduct(@Valid @RequestBody ProductDto productDto) {
        System.out.println("Processing addProduct request for: " + productDto.getName());
        try {
            return ResponseEntity.ok(productService.addProduct(productDto));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto productDto) {
        return productService.updateProduct(id, productDto)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productService.deleteProduct(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
}
