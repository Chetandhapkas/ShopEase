package com.shopease.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {
    private String fullName;
    private String phone;
    private String houseStreet;
    private String city;
    private String state;
    private String pinCode;
}
