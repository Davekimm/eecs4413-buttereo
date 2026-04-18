package com.dk.buttereo.services;

import com.dk.buttereo.models.Users;
import com.dk.buttereo.repositories.ProductRepo;
import com.dk.buttereo.repositories.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes default data for the application on startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProductRepo productRepo;

    /**
     * Initializes default data for the application on startup.
     * @param args Command-line arguments.
     */
    @Override
    public void run(String... args) throws Exception {

        // Adding default Admin account
        if (userRepo.findByUsername("dk") == null) {
            Users admin = createDefaultAdmin();
            Users user = createDefaultUser();

            userRepo.save(admin);
            userRepo.save(user);

            System.out.println("\nDefault Admin Account Created: dk / 123\n" +
                               "Default User Account Created: qwe / 123\n");
        } else {
            System.out.println("\nAdmin account already exists, skipping initialization\n");
        }

    }

    public Users createDefaultAdmin(){
        Users admin = new Users();
        admin.setUsername("dk");
        admin.setPassword(passwordEncoder.encode("123"));
        admin.setFirstName("Dave");
        admin.setLastName("Kim");
        admin.setEmail("dk@gmail.com");
        admin.setPhone("123-456-7890");
        admin.setAddress("Backyard");
        admin.setRole("ADMIN");

        return admin;
    }

    public Users createDefaultUser(){
        Users user = new Users();
        user.setUsername("qwe");
        user.setPassword(passwordEncoder.encode("123"));
        user.setFirstName("John");
        user.setLastName("Dog");
        user.setEmail("dog@gmail.com");
        user.setPhone("12988561");
        user.setAddress("Frontyard");
        user.setRole("USER");

        return user;
    }
}
