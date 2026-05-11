package com.vivriti.ecommerce.config;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(0)
public class ProductCategoryBackfillRunner implements ApplicationRunner {
	private final JdbcTemplate jdbcTemplate;

	public ProductCategoryBackfillRunner(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		Map<String, String> mappings = new LinkedHashMap<>();
		mappings.put("General", "GENERAL");
		mappings.put("Audio", "AUDIO");
		mappings.put("Wearables", "WEARABLES");
		mappings.put("Bags", "BAGS");
		mappings.put("Peripherals", "PERIPHERALS");
		mappings.put("Storage", "STORAGE");
		mappings.put("Fashion", "FASHION");
		mappings.put("Accessories", "ACCESSORIES");
		mappings.put("Gaming", "GAMING");

		for (Map.Entry<String, String> entry : mappings.entrySet()) {
			jdbcTemplate.update(
				"UPDATE products SET category = ? WHERE LOWER(category) = LOWER(?)",
				entry.getValue(),
				entry.getKey()
			);
		}

		jdbcTemplate.update(
			"UPDATE products SET category = 'GENERAL' WHERE category IS NULL OR TRIM(category) = ''"
		);
	}
}
