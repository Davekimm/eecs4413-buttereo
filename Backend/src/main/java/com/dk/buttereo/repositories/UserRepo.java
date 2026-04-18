package com.dk.buttereo.repositories;

import com.dk.buttereo.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing user data.
 */
@Repository
public interface UserRepo extends JpaRepository<Users, Integer> {
    Users findByUsername(String username);
    void deleteByUsername(String username);
}
