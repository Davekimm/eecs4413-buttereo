package com.dk.buttereo.repositories;

import com.dk.buttereo.models.OrderItem;
import com.dk.buttereo.models.Orders;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

// Detailed rule class for Specification for Product.
// Separating this from Services.
public class OrderSpecifications {

    public static Specification<Orders> betweenDate(LocalDateTime startDate, LocalDateTime endDate) {

        return (root, _, cb) -> {
            if(startDate != null && endDate != null){
                return cb.between(root.get("orderDate"), startDate, endDate);
            } else if(startDate != null){
                return cb.greaterThanOrEqualTo(root.get("orderDate"), startDate);
            }else{
                return cb.lessThanOrEqualTo(root.get("orderDate"), endDate);
            }
        };
    }

    public static Specification<Orders> containsProduct(String productName) {
        return (root, _, cb) -> {
            Join<Orders, OrderItem> items = root.join("orderItems");
            return cb.like(cb.lower(items.get("product").get("name")), "%" + productName.toLowerCase() + "%");
        };
    }

    public static Specification<Orders> containsCategory(String category) {
        return (root, _, cb) -> {
            Join<Orders, OrderItem> items = root.join("orderItems");
            return cb.equal(items.get("product").get("category"), category);
        };
    }

}
