package com.dk.buttereo.models;

import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for user information.
 */
@Getter
@Setter
public class UserDTO {

    private String username;

    private String firstName;
    private String lastName;

    private String email;
    private String phone;
    private String address;

    private String cardNumber;

    private String role;

    /**
     * Converts a Users entity to a UserDTO.
     * @param user The Users entity to convert.
     * @return The corresponding UserDTO.
     */
    public static UserDTO fromUser(Users user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        userDTO.setAddress(user.getAddress());
        userDTO.setCardNumber(user.getCardNumber());
        userDTO.setRole(user.getRole());
        return userDTO;
    }
}
