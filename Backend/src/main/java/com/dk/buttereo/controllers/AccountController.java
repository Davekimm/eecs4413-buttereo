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

/**
 * Controller for user account management.
 */
@RestController
@CrossOrigin
@RequestMapping("/api/account")
public class AccountController {

    @Autowired
    private AccountService accountService;


    /**
     * Retrieves the current authenticated user's information.
     *
     * @param authentication The user authentication object.
     * @return ResponseEntity containing the user's information or an error response.
     */
    @GetMapping
    public ResponseEntity<?> getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please login again.");
        }

        UserDTO user = accountService.findByUsername(authentication.getName());

        return ResponseEntity.ok(user);
    }

    /**
     * Updates the current user's information.
     *
     * @param authentication The user authentication object.
     * @param user The updated user information.
     * @return ResponseEntity indicating success or error.
     */
    @PutMapping
    public ResponseEntity<?> updateAuthenticatedUser(Authentication authentication, @RequestBody UserDTO user) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please login again.");
        }

        UserDTO userDTO = accountService.updateUserInfo(authentication.getName(), user);

        return ResponseEntity.ok(userDTO);
    }

    /**
     * Changes the current user's password.
     *
     * @param authentication The user authentication object.
     * @param request The password change request containing the new password.
     * @return ResponseEntity indicating success or error.
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> updatePassword(Authentication authentication, @RequestBody Map<String, String> request) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please login again.");
        }

        accountService.updatePassword(authentication.getName(), request.get("newPassword"));

        return ResponseEntity.ok("Password updated successfully");
    }

    /**
     * Deletes the current authenticated user's account.
     *
     * @param authentication The user authentication object.
     * @return ResponseEntity indicating success or error.
     */
    @DeleteMapping( "/delete")
    public ResponseEntity<?> deleteAuthenticatedUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please login again.");
        }

        accountService.deleteUser(authentication.getName());

        return ResponseEntity.ok("User deleted successfully");
    }

    //---------------------------------------------------- ADMIN -----------------------------------------------------

    /**
     * Retrieves all users for administrative purposes.
     *
     * @return ResponseEntity containing a list of user DTOs or an error response.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<UserDTO> userDTOs = accountService.getAllUsersByAdmin();
        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Updates user information for administrative purposes.
     *
     * @param username The username of the user to update.
     * @param user The updated user information.
     * @return ResponseEntity indicating success or error.
     */
    @PutMapping("/admin/update/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserInfoByAdmin(@PathVariable String username, @RequestBody UserDTO user) {
        if(user.getRole() == null){
            return ResponseEntity.badRequest().body("Role is required");
        }

        UserDTO userDTO = accountService.updateUserInfoByAdmin(username, user);
        return ResponseEntity.ok(userDTO);
    }

    /**
     * Deletes a user for administrative purposes.
     *
     * @param username The username of the user to delete.
     * @return ResponseEntity indicating success or error.
     */
    @DeleteMapping("/admin/delete/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        accountService.deleteUser(username);

        return ResponseEntity.ok("User deleted successfully");
    }

}
