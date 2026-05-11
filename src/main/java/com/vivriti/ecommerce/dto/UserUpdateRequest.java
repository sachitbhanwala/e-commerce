package com.vivriti.ecommerce.dto;

import com.vivriti.ecommerce.model.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    @NotBlank
    private String name;

    @NotNull
    private UserRole role;
}
