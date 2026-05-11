package com.vivriti.ecommerce.controller;

import com.vivriti.ecommerce.dto.ProductDto;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.service.WishlistService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishlists")
@CrossOrigin(origins = "http://localhost:3000", methods = { RequestMethod.GET, RequestMethod.POST,
        RequestMethod.DELETE })
public class WishlistController {
    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // ── Protected endpoints (authentication required) ─────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProductDto>> getMyWishlist(Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        return ResponseEntity.ok(wishlistService.getUserWishlist(user.getId()));
    }

    /**
     * Returns true/false whether the product is in the current user's wishlist.
     * Returns false (not 401) for unauthenticated users so the UI can safely call
     * this.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<Boolean> isInWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUser user)) {
            return ResponseEntity.ok(false);
        }
        return ResponseEntity.ok(wishlistService.isInWishlist(productId, user));
    }

    @PostMapping("/product/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addToWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        try {
            wishlistService.addToWishlist(productId, user);
            return ResponseEntity.ok().body("Added to wishlist");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @DeleteMapping("/product/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        AppUser user = (AppUser) authentication.getPrincipal();
        wishlistService.removeFromWishlist(productId, user);
        return ResponseEntity.noContent().build();
    }
}
