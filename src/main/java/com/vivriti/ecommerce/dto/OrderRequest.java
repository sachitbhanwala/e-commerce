package com.vivriti.ecommerce.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private String fullName;
    private String address;
    private String city;
    private String zip;
    private String paymentMethod;
    private String promoCode;
}
