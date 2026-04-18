package com.dk.buttereo.services;

import com.dk.buttereo.models.OrderDTO;
import com.dk.buttereo.models.Users;
import com.dk.buttereo.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Email Service for sending emails to customers regarding order updates.
 */
@Service
public class EmailService implements OrderObserver {

    @Autowired
    UserRepo userRepo;

    /**
     * Update method to handle order updates and send emails to users.
     * @param order OrderDTO containing order details
     */
    @Override
    public void update(OrderDTO order) {
        sendEmail(order);
    }

    /**
     * Email the user regarding the order summary.
     * @param order OrderDTO containing order details
     */
    public void sendEmail(OrderDTO order){
        // Email sending logic will be implemented here... This is to demonstrate simple email sending...
        Users user = userRepo.findByUsername(order.getUsername());

        System.out.println("Sending email for order: " + user.getEmail());
        System.out.println("Order details: " + order.toString());
    }
}
