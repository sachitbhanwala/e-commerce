package com.vivriti.ecommerce.dto;

import com.vivriti.ecommerce.model.UserRole;
import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserDetailResponse {
    private final Long id;
    private final String name;
    private final String email;
    private final UserRole role;
    private final Instant createdAt;
    private final String phone;
    private final String address;
    private final String city;
    private final String zip;
    private final String shippingName;
    private final List<OrderSummary> orders;
}
