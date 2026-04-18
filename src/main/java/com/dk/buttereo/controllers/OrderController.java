package com.dk.buttereo.controllers;

import com.dk.buttereo.models.OrderDTO;
import com.dk.buttereo.services.OrderService;
import com.dk.buttereo.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @GetMapping()
    public ResponseEntity<?> getOrderByUsername(Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrderByUsername(authentication.getName()));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getAllOrdersByUsername(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(Authentication authentication, @RequestBody OrderDTO orderRequest) {
        try{
            paymentService.verifyPayment(orderRequest.getCardNumber());
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body("Credit Card Authorization Failed");
        }

        try {
            OrderDTO order = orderService.createOrder(authentication.getName(), orderRequest);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create order");
        }
    }

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

    @GetMapping("/admin/all/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrdersByUsernameForAdmin(@PathVariable String username) {
        return ResponseEntity.ok(orderService.getAllOrdersByUsername(username));
    }

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