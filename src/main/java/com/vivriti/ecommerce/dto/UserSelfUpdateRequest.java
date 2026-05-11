package com.vivriti.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSelfUpdateRequest {
    @NotBlank
    private String name;

    private String phone;

    private String address;
}
