package com.dk.buttereo.services;

import org.springframework.stereotype.Component;

/**
 * One of the Stratigies for Payment in Strategy Pattern
 */
@Component
public class MasterCardStrategy implements IPaymentStrategy {
    // MasterCard starts with 51-55 - temporary simple implementation for testing

    /**
     * Check if the card number is for a MasterCard card.
     *
     * @param cardNumber User's card number
     * @return true if the card number starts with '51', '52', '53', '54', or '55', false otherwise
     */
    @Override
    public boolean support(String cardNumber) {
        return cardNumber != null && (cardNumber.startsWith("51") ||
                                        cardNumber.startsWith("52") ||
                                        cardNumber.startsWith("53") ||
                                        cardNumber.startsWith("54") ||
                                        cardNumber.startsWith("55"));
    }

    /**
     * Check if the card number is within the valid length for a MasterCard card.
     *
     * @param cardNumber User's card number
     * @return true if the card number length is 16 characters, false otherwise
     */
    @Override
    public boolean validate(String cardNumber) {
        return cardNumber.length() == 16;
    }

    /**
     * Process the payment for a MasterCard card.
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
