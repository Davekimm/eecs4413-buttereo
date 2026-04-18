package com.dk.buttereo.controllers;

import com.dk.buttereo.models.UserDTO;
import com.dk.buttereo.models.Users;
import com.dk.buttereo.services.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user authentication and registration.
 */
@RestController
@CrossOrigin
@RequestMapping("/api/auth")
public class AuthenticateController {

    @Autowired
    private AccountService service;

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Register a new user
     *
     * @param user The user registration data.
     * @param request The HTTP request object.
     * @return ResponseEntity indicating success or error.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Users user, HttpServletRequest request) {
        String password = user.getPassword();
        Users newUser = service.register(user);
        if(newUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body("Registration failed. Please try again.");
        }

        // Create authentication object and holds UserDetailsService object of the current user.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(newUser.getUsername(), password)
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();   // A context(ID card) for the current authenticated user.
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // Get the current session and attach the security context, then send back to Frontend with the session info.
        request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromUser(newUser));
    }
}
