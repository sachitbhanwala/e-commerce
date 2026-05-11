package com.vivriti.ecommerce.dto;

import com.vivriti.ecommerce.model.UserRole;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSummaryResponse {
    private final Long id;
    private final String name;
    private final String email;
    private final UserRole role;
    private final Instant createdAt;
}
