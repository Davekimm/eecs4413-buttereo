package com.dk.buttereo.repositories;

import com.dk.buttereo.models.Orders;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing order data.
 */
@Repository
public interface OrderRepo extends JpaRepository<Orders, Integer> {
    List<Orders> findByUserUsername(String username);
    Orders findFirstByUserUsernameOrderByIdDesc(String username);
    void deleteByUserUsername(String username);
    List<Orders> findAll(Specification<Orders> spec, Sort sort);
}
