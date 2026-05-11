package com.vivriti.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.vivriti.ecommerce.model.ProductCategory;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {

    private Long id;
    private String productId;
    private String productToken;
    @NotBlank
    private String name;
    @NotBlank
    private String image;
    private ProductCategory category;
    @NotBlank
    private String shortDescription;
    @NotBlank
    private String fullDescription;
    @NotNull
    @Positive
    private BigDecimal price;

    private boolean recommendedOnly;

    private List<String> imageUrls;

}