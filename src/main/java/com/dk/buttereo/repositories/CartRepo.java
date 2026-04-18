package com.dk.buttereo.repositories;

import com.dk.buttereo.models.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepo extends JpaRepository<Cart, Integer> {
    Cart findByUserUsername(String username);
}
