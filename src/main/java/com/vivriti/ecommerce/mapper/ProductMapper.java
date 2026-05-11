package com.vivriti.ecommerce.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.vivriti.ecommerce.dto.ProductDto;
import com.vivriti.ecommerce.model.Product;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductDto toDto(Product product);

    List<ProductDto> toDtoList(List<Product> products);

    Product toEntity(ProductDto productDto);
}
