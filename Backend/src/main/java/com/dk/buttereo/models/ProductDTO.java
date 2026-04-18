package com.dk.buttereo.models;

import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for product information.
 */
@Getter
@Setter
public class ProductDTO {

    private Integer id;
    private String name;
    private String description;
    private String brand;
    private Float price;
    private String category;
    private boolean available;
    private Integer quantity;

    private String imageName;
    private String imageType;
    @Lob
    private byte[] imageData;

    /**
     * Converts a Product entity to a ProductDTO.
     * @param product The Product entity to convert.
     * @return The corresponding ProductDTO.
     */
    public static ProductDTO fromProduct(Product product) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.id = product.getId();
        productDTO.name = product.getName();
        productDTO.description = product.getDescription();
        productDTO.brand = product.getBrand();
        productDTO.price = product.getPrice();
        productDTO.category = product.getCategory();
        productDTO.available = product.isAvailable();
        productDTO.quantity = product.getQuantity();

        productDTO.imageName = product.getImageName();
        productDTO.imageType = product.getImageType();
        productDTO.imageData = null;

        return productDTO;
    }
}
