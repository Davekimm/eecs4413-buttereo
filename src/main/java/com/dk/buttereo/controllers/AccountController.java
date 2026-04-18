package com.dk.buttereo.controllers;

import com.dk.buttereo.models.UserDTO;
import com.dk.buttereo.services.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/account")
public class AccountController {

    @Autowired
    private AccountService accountService;

    // Get the current authenticated user info
    @GetMapping
    public ResponseEntity<?> getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please login again.");
        }

        UserDTO user = accountService.findByUsername(authentication.getName());

        return ResponseEntity.ok(user);
    }

    // Update the current user's info
    @PutMapping
    public ResponseEntity<?> updateAuthenticatedUser(Authentication authentication, @RequestBody UserDTO user) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please login again.");
        }

        UserDTO userDTO = accountService.updateUserInfo(authentication.getName(), user);

        return ResponseEntity.ok(userDTO);
    }

    // Change the current user's password
    @PutMapping("/change-password")
    public ResponseEntity<?> updatePassword(Authentication authentication, @RequestBody Map<String, String> request) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please login again.");
        }

        accountService.updatePassword(authentication.getName(), request.get("newPassword"));

        return ResponseEntity.ok("Password updated successfully");
    }

    @DeleteMapping( "/delete")
    public ResponseEntity<?> deleteAuthenticatedUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please login again.");
        }

        accountService.deleteUser(authentication.getName());

        return ResponseEntity.ok("User deleted successfully");
    }

    //---------------------------------------------------- ADMIN -----------------------------------------------------

    // For ADMIN only - Get all users
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<UserDTO> userDTOs = accountService.getAllUsersByAdmin();
        return ResponseEntity.ok(userDTOs);
    }

    // For ADMIN only - Update user's info(email, phone, address, and cardNumber.)
    @PutMapping("/admin/update/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserInfoByAdmin(@PathVariable String username, @RequestBody UserDTO user) {
        if(user.getRole() == null){
            return ResponseEntity.badRequest().body("Role is required");
        }

        UserDTO userDTO = accountService.updateUserInfoByAdmin(username, user);
        return ResponseEntity.ok(userDTO);
    }

    // For ADMIN only - Delete user
    @DeleteMapping("/admin/delete/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        accountService.deleteUser(username);

        return ResponseEntity.ok("User deleted successfully");
    }

}
