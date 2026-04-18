package com.dk.buttereo.services;

import org.springframework.stereotype.Component;

@Component
public class VisaStrategy implements IPaymentStrategy {
    // Visa starts with 4 - temporary simple implementation for testing

    @Override
    public boolean support(String cardNumber) {
        return cardNumber != null && cardNumber.startsWith("4");
    }

    @Override
    public boolean validate(String cardNumber) {
        return cardNumber.length() >= 13 && cardNumber.length() <= 16;
    }

    @Override
    public boolean processPayment(String cardNumber) {
        // API call to VISA gateway
        // It returns true for now but detail to be implemented...
        return true;
    }

    @Override
    public void cancelPayment(String cardNumber) {
        // To be implemented...
    }

    @Override
    public void refundPayment(String cardNumber) {
        // To be implemented...
    }
}
