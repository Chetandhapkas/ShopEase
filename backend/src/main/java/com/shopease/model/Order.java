package com.shopease.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    @Indexed(unique = true)
    private String orderNumber;

    @Indexed
    private String userId;

    private String userEmail;

    private String userName;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private Address shippingAddress;

    private double subtotal;

    private String couponCode;

    private double couponDiscount;

    private double deliveryCharge;

    private double tax;

    private double totalAmount;

    private PaymentMethod paymentMethod; // COD, UPI, CARD, NET_BANKING

    private PaymentStatus paymentStatus; // PENDING, PAID, FAILED

    private OrderStatus orderStatus; // PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productName;
        private String productImage;
        private double price;
        private String size;
        private String color;
        private int quantity;
        private double subtotal;
    }

    public enum PaymentMethod {
        COD, UPI, CARD, NET_BANKING
    }

    public enum PaymentStatus {
        PENDING, PAID, FAILED
    }

    public enum OrderStatus {
        PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    }
}
