package com.dk.buttereo.services;

import org.springframework.stereotype.Component;

/**
 * One of the Stratigies for Payment in Strategy Pattern
 */
@Component
public class VisaStrategy implements IPaymentStrategy {
    // Visa starts with 4 - temporary simple implementation for testing

    /**
     * Check if the card number is for a Visa card.
     *
     * @param cardNumber User's card number
     * @return true if the card number starts with '4', false otherwise
     */
    @Override
    public boolean support(String cardNumber) {
        return cardNumber != null && cardNumber.startsWith("4");
    }

    /**
     * Check if the card number is within the valid length for a Visa card.
     *
     * @param cardNumber User's card number
     * @return true if the card number length is between 13 and 16 characters, false otherwise
     */
    @Override
    public boolean validate(String cardNumber) {
        return cardNumber.length() >= 13 && cardNumber.length() <= 16;
    }

    /**
     * Process the payment for a Visa card.
     * It returns true for now but detail to be implemented...
     *
     * @param cardNumber User's card number
     * @return true if payment processing is successful, false otherwise
     */
    @Override
    public boolean processPayment(String cardNumber) {
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
