package com.vivriti.ecommerce.service;

import com.vivriti.ecommerce.dto.CartDTO;
import com.vivriti.ecommerce.dto.CartItemDTO;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.model.Cart;
import com.vivriti.ecommerce.model.CartItem;
import com.vivriti.ecommerce.model.Product;

import com.vivriti.ecommerce.repository.CartRepository;
import com.vivriti.ecommerce.repository.ProductRepository;
import com.vivriti.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CartDTO getCart(String username) {
        Cart cart = getOrCreateCart(username);
        return mapToDTO(cart);
    }

    @Transactional
    public CartDTO addToCart(String username, Long productId, int quantity) {
        Cart cart = getOrCreateCart(username);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice());
            newItem.setCart(cart);
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        return mapToDTO(cart);
    }

    @Transactional
    public CartDTO removeFromCart(String username, Long productId) {
        Cart cart = getOrCreateCart(username);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cart = cartRepository.save(cart);
        return mapToDTO(cart);
    }

    @Transactional
    public CartDTO updateQuantity(String username, Long productId, int quantity) {
        Cart cart = getOrCreateCart(username);
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            if (quantity <= 0) {
                cart.getItems().remove(item);
            } else {
                item.setQuantity(quantity);
            }
        }
        cart = cartRepository.save(cart);
        return mapToDTO(cart);
    }

    @Transactional
    public void clearCart(String username) {
        Cart cart = getOrCreateCart(username);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(String username) {
        AppUser user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    private CartDTO mapToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setItems(cart.getItems().stream().map(this::mapItemToDTO).collect(Collectors.toList()));

        // Calculate total amount in DTO just in case, or trust the entity if it had
        // logic
        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(total);

        return dto;
    }

    private CartItemDTO mapItemToDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductImage(item.getProduct().getImage());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        dto.setTotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        return dto;
    }
}
