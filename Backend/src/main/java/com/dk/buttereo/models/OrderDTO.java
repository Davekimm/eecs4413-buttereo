package com.dk.buttereo.models;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for Order
 */
@Getter
@Setter
public class OrderDTO {

    private String username;

    private String address;
    private String cardNumber;

    private int orderId;
    private LocalDateTime orderDate;

    private float totalAmount;

    private List<OrderItemDTO> orderItems;

    /**
     * Converts an Orders entity to an OrderDTO.
     * @param order The Orders entity to convert.
     * @return The corresponding OrderDTO.
     */
    public static OrderDTO fromOrders(Orders order) {
        OrderDTO salesHistoryDTO = new OrderDTO();
        salesHistoryDTO.setUsername(order.getUser().getUsername());
        salesHistoryDTO.setAddress(order.getAddress());
        salesHistoryDTO.setCardNumber(order.getCardNumber());

        salesHistoryDTO.setOrderId(order.getId());
        salesHistoryDTO.setOrderDate(order.getOrderDate());
        salesHistoryDTO.setTotalAmount(order.getTotalAmount());

        salesHistoryDTO.setOrderItems(order.getOrderItems().stream()
                .map(OrderItemDTO::fromOrderItem)
                .toList());

        return salesHistoryDTO;
    }

    @Override
    public String toString() {
        return "\nOrder summary : " +
                "username='" + username + '\'' +
                ", address='" + address + '\'' +
                ", cardNumber='" + cardNumber + '\'' +
                ", orderId=" + orderId +
                ", orderDate=" + orderDate +
                ", totalAmount=" + totalAmount +
                ", orderItems=" + orderItems + "\n";
    }
}

// Default : by date
// Category : show all order of the selected category
//