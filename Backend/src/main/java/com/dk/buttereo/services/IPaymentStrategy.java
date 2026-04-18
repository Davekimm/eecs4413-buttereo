package com.dk.buttereo.services;

/**
 * Interface for payment processing strategies.
 */
public interface IPaymentStrategy {
    boolean support(String cardNumber);
    boolean validate(String cardNumber);
    boolean processPayment(String cardNumber);
    void cancelPayment(String cardNumber);
    void refundPayment(String cardNumber);
}
