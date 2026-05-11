package com.vivriti.ecommerce.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "product_id", nullable = false, unique = true, updatable = false)
    private String productId;
    @Column(name = "product_token", nullable = false, unique = true, updatable = false, length = 36)
    private String productToken;
    @NotBlank
    @Column(nullable = false)
    private String name;
    @NotBlank
    @Column(nullable = false, length = 2048)
    private String image;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;
    @NotBlank
    @Column(nullable = false, length = 500)
    private String shortDescription;
    @NotBlank
    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String fullDescription;
    @PositiveOrZero
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private boolean recommendedOnly;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @jakarta.persistence.JoinColumn(name = "product_id"))
    @Column(name = "image_url", length = 2048)
    private List<String> imageUrls = new ArrayList<>();

}
