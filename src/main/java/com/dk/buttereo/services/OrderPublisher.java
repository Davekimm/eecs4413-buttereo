package com.dk.buttereo.services;

import com.dk.buttereo.models.OrderDTO;

import java.util.ArrayList;
import java.util.List;

/**
 * Publisher in Observer Pattern for Order Service
 */
public class OrderPublisher {
    private final List<OrderObserver> observers = new ArrayList<>();

    /**
     * Attach an observer to the publisher
     *
     * @param observer observer to attach
     */
    public void attach(OrderObserver observer) {
        observers.add(observer);
    }

    /**
     * Detach an observer from the publisher
     *
     * @param observer observer to detach
     */
    public void detach(OrderObserver observer) {
        observers.remove(observer);
    }

    /**
     * Notify all observers about an order update
     *
     * @param order order to notify
     */
    public void notifyObservers(OrderDTO order) {
        for (OrderObserver observer : observers) {
            observer.update(order);
        }
    }
}
