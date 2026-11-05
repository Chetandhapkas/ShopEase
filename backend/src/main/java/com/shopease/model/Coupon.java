package com.shopease.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coupons")
public class Coupon {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private DiscountType discountType; // PERCENTAGE, FIXED

    private double discountValue;

    private double minPurchase;

    private double maxDiscount;

    private String expiryDate;

    @Builder.Default
    private boolean active = true;

    private String description;

    private int usageCount;

    public enum DiscountType {
        PERCENTAGE,
        FIXED
    }
}
