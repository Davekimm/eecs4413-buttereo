package com.dk.buttereo.controllers;

import com.dk.buttereo.models.OrderDTO;
import com.dk.buttereo.services.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for handling order-related operations.
 */
@RestController
@RequestMapping("/api/order")
public class OrderController  extends OrderPublisher {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CartService cartService;

    @Autowired
    private EmailService emailService;

    /**
     * Initializes the OrderController by attaching dependencies for Observer pattern.
     */
    @PostConstruct
    public void init() {
        this.attach(cartService);
        this.attach(emailService);
    }

    /**
     * Retrieves the order for the authenticated user.
     *
     * @param authentication The authentication object containing user information.
     * @return ResponseEntity containing the order or HTTP status code.
     */
    @GetMapping()
    public ResponseEntity<?> getOrderByUsername(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrderByUsername(authentication.getName()));
    }

    /**
     * Retrieves all orders for the authenticated user.
     *
     * @param authentication The authentication object containing user information.
     * @return ResponseEntity containing a list of orders or HTTP status code.
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getAllOrdersByUsername(authentication.getName()));
    }

    /**
     * Creates a new order for the authenticated user.
     *
     * @param authentication The authentication object containing user information.
     * @param orderRequest The order details provided by the user.
     * @return ResponseEntity containing the created order or HTTP status code.
     */
    @PostMapping
    public ResponseEntity<?> createOrder(Authentication authentication, @RequestBody OrderDTO orderRequest) {
        try{
            paymentService.verifyPayment(orderRequest.getCardNumber());
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body("Credit Card Authorization Failed");
        }

        try {
            OrderDTO order = orderService.createOrder(authentication.getName(), orderRequest);

            notifyObservers(order);

            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create order");
        }
    }

    /**
     * Deletes the order for the authenticated user.
     *
     * @param authentication The authentication object containing user information.
     * @return ResponseEntity with HTTP status code indicating success or failure.
     */
    @DeleteMapping
    public ResponseEntity<?> deleteOrder(Authentication authentication) {
        try{
            orderService.deleteOrder(authentication.getName());
            return ResponseEntity.ok("Order deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete order");
        }
    }

    // ----------------------------------------------- ADMIN ------------------------------------------------------

    /**
     * Retrieves all orders for a specific user by username for admin purposes.
     *
     * @param username The username of the user for whom to retrieve orders.
     * @return ResponseEntity containing a list of orders or HTTP status code.
     */
    @GetMapping("/admin/all/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrdersByUsernameForAdmin(@PathVariable String username) {
        return ResponseEntity.ok(orderService.getAllOrdersByUsername(username));
    }

    /**
     * Retrieves sales history for admin purposes, allowing filtering by date range, product, and category.
     *
     * @param startDate The start date for filtering sales history (optional).
     * @param endDate The end date for filtering sales history (optional).
     * @param productName The name of the product to filter by (optional).
     * @param categoryName The name of the category to filter by (optional).
     * @return ResponseEntity containing filtered sales history or HTTP status code.
     */
    @GetMapping("/admin/sales-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSalesHistory(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
                                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
                                             @RequestParam(required = false) String productName,
                                             @RequestParam(required = false) String categoryName
    ) {

        List<OrderDTO> orderDTO = orderService.getFilterSalesHistory(startDate, endDate, productName, categoryName);

        return ResponseEntity.ok(orderDTO);
    }
}

// default: Recent ones come first... Maybe up to 10?
// Admin can select: 1. By date / 2. By product / 3. By category - Admin can choose
// All filters apply in overlap