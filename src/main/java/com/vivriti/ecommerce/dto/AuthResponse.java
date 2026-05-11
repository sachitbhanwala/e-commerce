package com.vivriti.ecommerce.dto;

import com.vivriti.ecommerce.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private final String message;
    private final String email;
    private final String name;
    private final UserRole role;
    private final String token;
    private final String address;
    private final String city;
    private final String zip;
    private final String shippingName;
}
