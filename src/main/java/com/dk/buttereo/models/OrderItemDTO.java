package com.dk.buttereo.models;

import jakarta.persistence.Lob;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for OrderItem
 */
@Getter
@Setter
public class OrderItemDTO {

    private Integer orderedItemId;

    private Integer productId;

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
     * Converts an OrderItem entity to an OrderItemDTO.
     * @param orderItem The OrderItem entity to convert.
     * @return The corresponding OrderItemDTO.
     */
    public static OrderItemDTO fromOrderItem(OrderItem orderItem) {
        OrderItemDTO orderItemDTO = new OrderItemDTO();
        orderItemDTO.orderedItemId = orderItem.getId();
        orderItemDTO.productId = orderItem.getProduct().getId();
        orderItemDTO.name = orderItem.getProduct().getName();
        orderItemDTO.description = orderItem.getProduct().getDescription();
        orderItemDTO.brand = orderItem.getProduct().getBrand();
        orderItemDTO.price = orderItem.getPrice();
        orderItemDTO.category = orderItem.getProduct().getCategory();
        orderItemDTO.available = orderItem.getProduct().isAvailable();
        orderItemDTO.quantity = orderItem.getQuantity();

        orderItemDTO.imageName = orderItem.getProduct().getImageName();
        orderItemDTO.imageType = orderItem.getProduct().getImageType();
        orderItemDTO.imageData = orderItem.getProduct().getImageData();

        return orderItemDTO;
    }
}
