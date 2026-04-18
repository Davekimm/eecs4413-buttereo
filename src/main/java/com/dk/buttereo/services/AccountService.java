package com.dk.buttereo.services;

import com.dk.buttereo.models.Cart;
import com.dk.buttereo.models.UserDTO;
import com.dk.buttereo.models.Users;
import com.dk.buttereo.repositories.CartRepo;
import com.dk.buttereo.repositories.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AccountService implements UserDetailsService {

    @Autowired
    private UserRepo AccountRepo;

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private OrderService orderService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String userName) {
        Users appUser = AccountRepo.findByUsername(userName);

        if (appUser == null) {
            throw new UsernameNotFoundException("User not found with username: " + userName);
        }

        return User.builder()
                    .username(appUser.getUsername())
                    .password(appUser.getPassword())
                    .build();
    }

    // Returning a User object for authentication.
    @Transactional
    public Users register(Users user) {
        Users newUser = AccountRepo.save(user);
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));

        Cart cart = new Cart();
        cart.setUser(newUser);
        cart.setCartItems(new ArrayList<>());
        cartRepo.save(cart);

        return newUser;
    }

    public UserDTO findByUsername(String userName) {

        Users user = AccountRepo.findByUsername(userName);

        return UserDTO.fromUser(user);
    }

    @Transactional
    public UserDTO updateUserInfo(String username, UserDTO user) {
        Users existing = AccountRepo.findByUsername(username);
        if (existing == null) {
            throw new UsernameNotFoundException("User not found");
        }

        if (user.getFirstName() != null) {
            existing.setFirstName(user.getFirstName());
        }
        if (user.getLastName() != null) {
            existing.setLastName(user.getLastName());   
        }
        if (user.getEmail() != null) {
            existing.setEmail(user.getEmail());
        }
        if (user.getPhone() != null) {
            existing.setPhone(user.getPhone());
        }
        if (user.getAddress() != null) {
            existing.setAddress(user.getAddress());
        }
        if (user.getCardNumber() != null) {
            existing.setCardNumber(user.getCardNumber());
        }

        AccountRepo.save(existing);

        return UserDTO.fromUser(existing);
    }

    @Transactional
    public void updatePassword(String username, String newPassword) {
        Users existing = AccountRepo.findByUsername(username);
        if (existing == null) {
            throw new UsernameNotFoundException("User not found");
        }
        existing.setPassword(passwordEncoder.encode(newPassword));

        AccountRepo.save(existing);
    }

    @Transactional
    public void deleteUser(String username) {
        orderService.deleteOrder(username);
        Cart cart = cartRepo.findByUserUsername(username);
        if (cart != null) {
            if (cart.getCartItems() != null) {
                cart.getCartItems().clear();
            }
            cartRepo.delete(cart);
        }
        AccountRepo.deleteByUsername(username);
    }

    public List<UserDTO> getAllUsersByAdmin() {

        List<Users> allUsers = AccountRepo.findAll();

        List<UserDTO> userDTOs = new ArrayList<>();
        for (Users user : allUsers) {
            UserDTO userDTO = UserDTO.fromUser(user);
            userDTOs.add(userDTO);
        }

        return userDTOs;
    }

    public UserDTO updateUserInfoByAdmin(String username, UserDTO user) {
        Users existing = AccountRepo.findByUsername(username);
        if (existing == null) {
            throw new UsernameNotFoundException("User not found");
        }

        if (user.getFirstName() != null) {
            existing.setFirstName(user.getFirstName());
        }
        if (user.getLastName() != null) {
            existing.setLastName(user.getLastName());
        }
        if (user.getEmail() != null) {
            existing.setEmail(user.getEmail());
        }
        if (user.getPhone() != null) {
            existing.setPhone(user.getPhone());
        }
        if (user.getAddress() != null) {
            existing.setAddress(user.getAddress());
        }
        if (user.getCardNumber() != null) {
            existing.setCardNumber(user.getCardNumber());
        }
        if (user.getRole() != null) {
            existing.setRole(user.getRole());
        }

        AccountRepo.save(existing);

        return UserDTO.fromUser(existing);
    }


}
