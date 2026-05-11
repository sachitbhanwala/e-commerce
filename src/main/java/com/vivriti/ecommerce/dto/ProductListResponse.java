package com.vivriti.ecommerce.dto;

import java.util.List;

public class ProductListResponse {
    private List<ProductDto> products;
    private int total;

    public ProductListResponse(List<ProductDto> products, int total) {
        this.products = products;
        this.total = total;
    }

    public List<ProductDto> getProducts() {
        return products;
    }

    public void setProducts(List<ProductDto> products) {
        this.products = products;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}
