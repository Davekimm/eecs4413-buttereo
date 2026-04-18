package com.dk.buttereo.services;

import com.dk.buttereo.models.*;
import com.dk.buttereo.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for managing order-related operations. Subject to Observer Pattern
 */
@Service
public class OrderService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CartRepo CartRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private ProductRepo productRepo;

    /**
     * Get the latest order by username
     *
     * @param username username
     * @return OrderDTO
     */
    public OrderDTO getOrderByUsername(String username) {
        Orders order = orderRepo.findFirstByUserUsernameOrderByIdDesc(username);

        return OrderDTO.fromOrders(order);
    }

    /**
     * Get all orders by username
     *
     * @param username username
     * @return List of OrderDTO
     */
    public List<OrderDTO> getAllOrdersByUsername(String username) {
        List<Orders> orders = orderRepo.findByUserUsername(username);
        List<OrderDTO> orderDTOs = new ArrayList<>();
        orders.forEach(item -> orderDTOs.add(OrderDTO.fromOrders(item)));

        return orderDTOs;
    }

    /**
     * Create an order
     *
     * @param username username
     * @param orderRequest order request DTO
     * @return OrderDTO
     */
    @Transactional
    public OrderDTO createOrder(String username, OrderDTO orderRequest) {
        Users user = userRepo.findByUsername(username);

        List<OrderItem> orderItems = new ArrayList<>();
        float totalPrice = 0;

        Cart cart = CartRepo.findByUserUsername(username);
        if (cart == null || cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        for(CartItem cartItem : cart.getCartItems()){
            Product product = cartItem.getProduct();

            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Product " + product.getName() + " is out of stock.");
            }

            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepo.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            totalPrice += cartItem.getProduct().getPrice() * cartItem.getQuantity();

            orderItems.add(orderItem);
        }

        // Building an order by Builder pattern.
        Orders order = Orders.builder()
                            .user(user)
                            .address(orderRequest.getAddress())
                            .cardNumber(orderRequest.getCardNumber())
                            .orderDate(LocalDateTime.now())
                            .totalAmount(totalPrice)
                            .orderItems(orderItems)
                            .build();

        order.getOrderItems().forEach(item -> item.setOrder(order));

        orderRepo.save(order);

        return OrderDTO.fromOrders(order);
    }

    /**
     * Delete an order by username
     *
     * @param username username
     */
    @Transactional
    public void deleteOrder(String username) {
        orderRepo.deleteByUserUsername(username);
    }

    /**
     * Get the sales history of the user
     *
     * @param startDate start date
     * @param endDate end date
     * @param productName product name
     * @param categoryName category name
     * @return List of OrderDTO
     */
    public List<OrderDTO> getFilterSalesHistory(LocalDateTime startDate, LocalDateTime endDate,
                                               String productName, String categoryName)
    {

        Specification<Orders> spec = (_, _, cb) -> cb.conjunction();

        if (startDate != null || endDate != null) spec = spec.and(OrderSpecifications.betweenDate(startDate, endDate));

        if (productName != null) spec = spec.and(OrderSpecifications.containsProduct(productName));

        if (categoryName != null) spec = spec.and(OrderSpecifications.containsCategory(categoryName));

        Sort sort = Sort.by(Sort.Direction.DESC, "orderDate");

        List<Orders> orders = orderRepo.findAll(spec, sort);

        if (startDate == null && endDate == null && productName == null && categoryName == null) {
            return orders.stream().limit(10).map(OrderDTO::fromOrders).toList();
        }

        return orders.stream().map(OrderDTO::fromOrders).toList();
    }
}
