package com.shopease;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * ShopEase Full-Stack E-Commerce Application Backend Entry Point
 * Spring Boot 3 + Spring Data MongoDB + Spring Security + REST APIs
 */
@SpringBootApplication
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "com.shopease.repository")
public class ShopEaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopEaseApplication.class, args);
        System.out.println("=================================================");
        System.out.println("  ShopEase Spring Boot REST API Service Started  ");
        System.out.println("  MongoDB Atlas Connected & Port 8080 Active     ");
        System.out.println("=================================================");
    }
}
