package com.dk.buttereo.models;

import lombok.Getter;
import lombok.Setter;

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
