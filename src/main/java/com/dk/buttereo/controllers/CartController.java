package com.dk.buttereo.controllers;

import com.dk.buttereo.models.CartItem;
import com.dk.buttereo.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService service;

    @GetMapping("/items")
    public ResponseEntity<?> getCartItems(Authentication authentication) {
        List<CartItem> items = service.getProductsInCart(authentication.getName());
        if(items == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(items);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addProductToCart(Authentication authentication, @RequestParam Integer productId, @RequestParam Integer quantity) {
        try{
            service.addProductToCart(authentication.getName(), productId, quantity);

            return ResponseEntity.ok("Product added to cart successfully");

        } catch (Exception e) {
            return ResponseEntity.status(400).body("Product not found or out of stock.");
        }

    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProductQuantity(Authentication authentication, @RequestParam Integer productId, @RequestParam Integer newQuantity) {
        service.updateProductQuantity(authentication.getName(), productId, newQuantity);

        return ResponseEntity.ok("Product quantity updated successfully");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeProductFromCart(Authentication authentication, @RequestParam Integer productId) {
        service.removeProductFromCart(authentication.getName(), productId);

        return ResponseEntity.ok("Product removed from cart successfully");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        service.clearCart(authentication.getName());

        return ResponseEntity.ok("Cart cleared successfully");
    }
}
