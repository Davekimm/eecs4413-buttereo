package com.dk.buttereo.services;

import com.dk.buttereo.models.Cart;
import com.dk.buttereo.models.CartItem;
import com.dk.buttereo.models.Product;
import com.dk.buttereo.repositories.CartRepo;
import com.dk.buttereo.repositories.ProductRepo;
import com.dk.buttereo.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    @Autowired
    CartRepo cartRepo;

    @Autowired
    UserRepo accountRepo;
    @Autowired
    ProductRepo productRepo;

    public List<CartItem> getProductsInCart(String username) {
        Cart cart = cartRepo.findByUserUsername(username);
        if (cart == null) {
            return null;
        }
        return cart.getCartItems();
    }

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

    @Transactional
    public void clearCart(String username) {
        Cart cart = cartRepo.findByUserUsername(username);
        if (cart == null) {
            return;
        }
        cart.getCartItems().clear();

        cartRepo.save(cart);
    }
}
