package com.vivriti.ecommerce.dto;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderSummary {
    private final Long id;
    private final BigDecimal totalAmount;
    private final String status;
    private final Instant createdAt;
}
