package com.dk.buttereo.services;

import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Payment service for managing Payment Strategies
 */
@Service
public class PaymentService {

    private final List<IPaymentStrategy> strategies;

    // Visa & MasterCard Strategies injected
    public PaymentService(List<IPaymentStrategy> strategies) {
        this.strategies = strategies;
    }

    /**
     * Verify payment using card number
     *
     * @param cardNumber credit card number
     * @throws RuntimeException if payment verification fails
     */
    public void verifyPayment(String cardNumber) {

        IPaymentStrategy payment = strategies.stream()
                .filter(strategy -> strategy.support(cardNumber) && strategy.validate(cardNumber))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Credit Card Authorization Failed."));

        boolean paid = payment.processPayment(cardNumber);

        if(!paid){
            throw new RuntimeException("Credit Card Payment Failed.");
        }

    }
}

