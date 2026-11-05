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
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    @Indexed
    private String brand;

    @Indexed
    private String category; // category id or slug

    private String gender; // Men, Women, Unisex

    private double price;

    private double originalPrice;

    private int discount; // percentage

    @Builder.Default
    private List<String> sizes = new ArrayList<>();

    @Builder.Default
    private List<String> colors = new ArrayList<>();

    private int stockQuantity;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    private double rating;

    private int reviewsCount;

    @Builder.Default
    private boolean active = true;

    private boolean trending;

    private boolean newArrival;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
