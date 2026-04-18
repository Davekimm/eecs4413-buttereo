package com.dk.buttereo.controllers;

import com.dk.buttereo.models.CartItem;
import com.dk.buttereo.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing user cart operations.
 */
@RestController
@CrossOrigin
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService service;

    /**
     * Retrieves the list of cart items for the authenticated user.
     *
     * @param authentication The user authentication object.
     * @return ResponseEntity containing the list of cart items or HTTP status code.
     */
    @GetMapping("/items")
    public ResponseEntity<?> getCartItems(Authentication authentication) {
        List<CartItem> items = service.getProductsInCart(authentication.getName());
        if(items == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(items);
    }

    /**
     * Adds a product to the user's cart.
     *
     * @param authentication The user authentication object.
     * @param productId The ID of the product to add.
     * @param quantity The quantity of the product to add.
     * @return ResponseEntity indicating success or error.
     */
    @PostMapping("/add")
    public ResponseEntity<?> addProductToCart(Authentication authentication, @RequestParam Integer productId, @RequestParam Integer quantity) {
        try{
            service.addProductToCart(authentication.getName(), productId, quantity);

            return ResponseEntity.ok("Product added to cart successfully");

        } catch (Exception e) {
            return ResponseEntity.status(400).body("Product not found or out of stock.");
        }

    }

    /**
     * Updates the quantity of a product in the user's cart.
     *
     * @param authentication The user authentication object.
     * @param productId The ID of the product to update.
     * @param newQuantity The new quantity of the product.
     * @return ResponseEntity indicating success or error.
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateProductQuantity(Authentication authentication, @RequestParam Integer productId, @RequestParam Integer newQuantity) {
        service.updateProductQuantity(authentication.getName(), productId, newQuantity);

        return ResponseEntity.ok("Product quantity updated successfully");
    }

    /**
     * Removes a product from the user's cart.
     *
     * @param authentication The user authentication object.
     * @param productId The ID of the product to remove.
     * @return ResponseEntity indicating success or error.
     */
    @DeleteMapping("/remove")
    public ResponseEntity<?> removeProductFromCart(Authentication authentication, @RequestParam Integer productId) {
        service.removeProductFromCart(authentication.getName(), productId);

        return ResponseEntity.ok("Product removed from cart successfully");
    }

    /**
     * Clears the user's cart, removing all items.
     *
     * @param authentication The user authentication object.
     * @return ResponseEntity indicating success or error.
     */
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        service.clearCart(authentication.getName());

        return ResponseEntity.ok("Cart cleared successfully");
    }
}
