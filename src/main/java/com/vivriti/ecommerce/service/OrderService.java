package com.vivriti.ecommerce.service;

import com.vivriti.ecommerce.dto.OrderDTO;
import com.vivriti.ecommerce.dto.OrderItemDTO;
import com.vivriti.ecommerce.dto.OrderRequest;
import com.vivriti.ecommerce.model.*;
import com.vivriti.ecommerce.repository.CartRepository;
import com.vivriti.ecommerce.repository.OrderRepository;
import com.vivriti.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDTO placeOrder(String username, OrderRequest request) {
        AppUser user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        BigDecimal currentTotal = cart.getTotalAmount();
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
            String code = request.getPromoCode().trim().toUpperCase();
            if ("WELCOME10".equals(code)) {
                currentTotal = currentTotal.multiply(new BigDecimal("0.90"));
            } else if ("FLAT50".equals(code)) {
                currentTotal = currentTotal.subtract(new BigDecimal("50.00"));
                if (currentTotal.compareTo(BigDecimal.ZERO) < 0) {
                    currentTotal = BigDecimal.ZERO;
                }
            } else {
                throw new RuntimeException("Invalid promo code: " + code);
            }
        }
        order.setTotalAmount(currentTotal);

        // Construct full address from request
        String shippingAddress = String.format("%s, %s, %s, %s",
                request.getFullName(), request.getAddress(), request.getCity(), request.getZip());
        order.setShippingAddress(shippingAddress);

        // Update user's address if not set or if changed (optional logic, simplifed to
        // always update for now as per requirement "auto save")
        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null && !request.getCity().isEmpty()) {
            user.setCity(request.getCity());
        }
        if (request.getZip() != null && !request.getZip().isEmpty()) {
            user.setZip(request.getZip());
        }
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setShippingName(request.getFullName());
        }
        // user is managed entity? No, it was fetched. But we need to save it if we
        // modified it.
        // Actually since we are in @Transactional, and 'user' is an entity attached to
        // the persistence context (if we used standard JPA),
        // changes might be auto-flushed. ensure repository.save is called to be
        // explicit.
        userRepository.save(user);

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            order.addItem(orderItem);
        }

        order = orderRepository.save(order);

        // Clear the cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getUserOrders(String username) {
        AppUser user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(String username, Long orderId) {
        AppUser user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to order");
        }

        return mapToDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(String username, Long orderId) {
        AppUser user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapToDTO(orderRepository.save(order));
    }

    private OrderDTO mapToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setItems(order.getItems().stream().map(this::mapItemToDTO).collect(Collectors.toList()));
        return dto;
    }

    private OrderItemDTO mapItemToDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
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
