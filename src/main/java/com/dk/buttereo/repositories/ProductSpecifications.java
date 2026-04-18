package com.dk.buttereo.repositories;

import com.dk.buttereo.models.Product;
import org.springframework.data.jpa.domain.Specification;

// Detailed rule class for Specification for a query.
// Separating this from Services.
public final class ProductSpecifications {

    // Match rule for category
    public static Specification<Product> hasCategory(String category) {
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    // Match rule for keyword in name, brand, category, and description.
    public static Specification<Product> matchKeyword(String keyword) {
        String trimmedKeyword = keyword.trim();
        // Wrap with % so SQL LIKE finds the word anywhere inside the field.
        String keywordPattern = "%" + trimmedKeyword.toLowerCase() + "%";

        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), keywordPattern),
                cb.like(cb.lower(root.get("brand")), keywordPattern),
                cb.like(cb.lower(root.get("category")), keywordPattern),
                cb.like(cb.lower(root.get("description")), keywordPattern)
        );
    }
}
