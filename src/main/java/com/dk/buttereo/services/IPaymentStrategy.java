package com.dk.buttereo.services;

public interface IPaymentStrategy {
    boolean support(String cardNumber);
    boolean validate(String cardNumber);
    boolean processPayment(String cardNumber);
    void cancelPayment(String cardNumber);
    void refundPayment(String cardNumber);
}
