package com.dk.buttereo.services;

import com.dk.buttereo.models.*;
import com.dk.buttereo.repositories.CartRepo;
import com.dk.buttereo.repositories.ProductRepo;
import com.dk.buttereo.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service class for managing cart-related operations. An Observer role in Observer Pattern
 */
@Service
public class CartService implements OrderObserver {

    @Autowired
    CartRepo cartRepo;

    @Autowired
    UserRepo accountRepo;

    @Autowired
    ProductRepo productRepo;

    /**
     * Retrieve products in the cart for a given user.
     * @param username User's username
     * @return List of CartItem objects or null if cart is empty
     */
    public List<CartItem> getProductsInCart(String username) {
        Cart cart = cartRepo.findByUserUsername(username);
        if (cart == null) {
            return null;
        }
        return cart.getCartItems();
    }

    /**
     * Add a product to the cart for a given user.
     * @param username User's username
     * @param productId Product ID
     * @param quantity Quantity of the product to add
     */
    @Transactional
    public void addProductToCart(String username, Integer productId, Integer quantity) {
        Cart cart = cartRepo.findByUserUsername(username);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(accountRepo.findByUsername(username));
            cart.setCartItems(new ArrayList<>());
            cartRepo.save(cart);
        }

        Product productToAdd = productRepo.findById(productId).orElse(null);

        if(productToAdd == null) {
            throw new IllegalArgumentException("Product not found");
        }

        if(quantity > productToAdd.getQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock");
        }

        for(CartItem existingItem : cart.getCartItems()) {
            if(existingItem.getProduct().getId().equals(productId)) {
                existingItem.setQuantity(existingItem.getQuantity() + quantity);
                cartRepo.save(cart);
                return;
            }
        }

        CartItem newItem = new CartItem();
        newItem.setProduct(productToAdd);
        newItem.setQuantity(quantity);
        newItem.setCart(cart);

        cart.getCartItems().add(newItem);

        cartRepo.save(cart);
    }

    /**
     * Update the quantity of a product in the cart for a given user.
     * @param username User's username
     * @param productId Product ID
     * @param newQuantity New quantity of the product
     */
    @Transactional
    public void updateProductQuantity(String username, Integer productId, Integer newQuantity) {
        Cart cart = cartRepo.findByUserUsername(username);
        if (cart == null) {
            return;
        }

        List<CartItem> existingItems = cart.getCartItems();
        for(CartItem existingItem : existingItems) {
            if(existingItem.getProduct().getId().equals(productId)) {
                existingItem.setQuantity(newQuantity);
                cartRepo.save(cart);
                break;
            }
        }
    }

    /**
     * Remove a product from the cart for a given user.
     * @param username User's username
     * @param productId Product ID
     */
    @Transactional
    public void removeProductFromCart(String username, Integer productId) {
        Cart cart = cartRepo.findByUserUsername(username);
        if (cart == null) {
            return;
        }

        List<CartItem> existingItems = cart.getCartItems();
        for(CartItem existingItem : existingItems) {
            if(existingItem.getProduct().getId().equals(productId)) {
                existingItems.remove(existingItem);
                cartRepo.save(cart);
                break;
            }
        }
    }

    /**
     * Clear the cart for a given user.
     * @param username User's username
     */
    @Transactional
    public void clearCart(String username) {
        Cart cart = cartRepo.findByUserUsername(username);
        if (cart == null) {
            return;
        }
        cart.getCartItems().clear();

        cartRepo.save(cart);
    }

    /**
     * Update the cart when an order is placed.
     * @param order Order details
     */
    @Override
    public void update(OrderDTO order) {
        Cart cart = cartRepo.findByUserUsername(order.getUsername());
        if (cart == null) {
            return;
        }
        cart.getCartItems().clear();

        System.out.println("\nCart cleared after order placed\n");

        cartRepo.save(cart);
    }
}
