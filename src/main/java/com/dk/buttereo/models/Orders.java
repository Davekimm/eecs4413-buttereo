package com.dk.buttereo.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity class for Orders
 */
@Setter
@Getter
@Entity
@NoArgsConstructor
@Table(name = "orders")
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private Users user;

    private String address;
    private String cardNumber;

    private LocalDateTime orderDate;
    private float totalAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<OrderItem> orderItems;

    /**
     * Private constructor for Orders using builder pattern.
     * @param builder The builder instance containing order details.
     */
    private Orders(OrdersBuilder builder) {
        this.user = builder.user;
        this.address = builder.address;
        this.cardNumber = builder.cardNumber;
        this.orderDate = builder.orderDate;
        this.totalAmount = builder.totalAmount;
        this.orderItems = builder.orderItems;
    }

    /**
     * Builder class for Orders creation
     */
    public static class OrdersBuilder {
        private Users user;
        private String address;
        private String cardNumber;
        private LocalDateTime orderDate;
        private float totalAmount;
        private List<OrderItem> orderItems;

        public OrdersBuilder user(Users user) { this.user = user; return this; }
        public OrdersBuilder address(String address) { this.address = address; return this; }
        public OrdersBuilder cardNumber(String card) { this.cardNumber = card; return this; }
        public OrdersBuilder orderDate(LocalDateTime date) { this.orderDate = date; return this; }
        public OrdersBuilder totalAmount(float amount) { this.totalAmount = amount; return this; }
        public OrdersBuilder orderItems(List<OrderItem> items) { this.orderItems = items; return this; }

        /**
         * Builds the Orders instance with default order date if not provided.
         * @return The constructed Orders instance.
         */
        public Orders build() {
            if (this.orderDate == null) {
                this.orderDate = LocalDateTime.now();       // Set default order date to current time
            }
            return new Orders(this);
        }
    }

    /**
     * Static method to create an OrdersBuilder instance.
     * @return An OrdersBuilder instance.
     */
    public static OrdersBuilder builder() {
        return new OrdersBuilder();
    }
}
