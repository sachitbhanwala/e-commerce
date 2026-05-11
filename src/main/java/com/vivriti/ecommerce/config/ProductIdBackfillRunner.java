package com.vivriti.ecommerce.config;

import java.util.List;
import java.util.UUID;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.vivriti.ecommerce.model.Product;
import com.vivriti.ecommerce.repository.ProductRepository;

@Component
@Order(1)
public class ProductIdBackfillRunner implements ApplicationRunner {
    private final ProductRepository productRepository;

    public ProductIdBackfillRunner(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Product> missingProductIds = productRepository.findByProductIdIsNullOrProductId("");
        if (missingProductIds.isEmpty()) {
            return;
        }

        for (Product product : missingProductIds) {
            product.setProductId(UUID.randomUUID().toString());
        }

        productRepository.saveAll(missingProductIds);
    }
}
