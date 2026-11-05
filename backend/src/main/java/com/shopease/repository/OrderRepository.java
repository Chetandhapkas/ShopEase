package com.shopease.repository;

import com.shopease.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByOrderStatus(Order.OrderStatus status);
    long countByOrderStatusIn(List<Order.OrderStatus> statuses);
}
