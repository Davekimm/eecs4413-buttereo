package com.dk.buttereo.services;

import com.dk.buttereo.models.OrderDTO;


/**
 * Listener in Observer Pattern for Order Service
 */
public interface OrderObserver {
    void update(OrderDTO order);
}
