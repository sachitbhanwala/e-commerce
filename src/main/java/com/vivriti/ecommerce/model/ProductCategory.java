package com.vivriti.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductCategory {
	GENERAL("General"),
	AUDIO("Audio"),
	WEARABLES("Wearables"),
	BAGS("Bags"),
	PERIPHERALS("Peripherals"),
	STORAGE("Storage"),
	FASHION("Fashion"),
	ACCESSORIES("Accessories"),
	GAMING("Gaming");

	private final String label;

	ProductCategory(String label) {
		this.label = label;
	}

	@JsonValue
	public String getLabel() {
		return label;
	}

	@JsonCreator
	public static ProductCategory fromValue(String value) {
		if (value == null || value.trim().isEmpty()) {
			return GENERAL;
		}

		String normalized = value.trim();
		for (ProductCategory category : values()) {
			if (category.label.equalsIgnoreCase(normalized)
					|| category.name().equalsIgnoreCase(normalized)) {
				return category;
			}
		}

		return GENERAL;
	}
}
