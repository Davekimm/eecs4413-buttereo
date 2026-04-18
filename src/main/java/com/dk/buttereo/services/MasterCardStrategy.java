package com.dk.buttereo.services;

import org.springframework.stereotype.Component;

@Component
public class MasterCardStrategy implements IPaymentStrategy {
    // MasterCard starts with 51-55 - temporary simple implementation for testing

    @Override
    public boolean support(String cardNumber) {
        return cardNumber != null && (cardNumber.startsWith("51") ||
                                        cardNumber.startsWith("52") ||
                                        cardNumber.startsWith("53") ||
                                        cardNumber.startsWith("54") ||
                                        cardNumber.startsWith("55"));
    }

    @Override
    public boolean validate(String cardNumber) {
        return cardNumber.length() == 16;
    }

    @Override
    public boolean processPayment(String cardNumber) {
        // API call to MasterCard gateway
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
