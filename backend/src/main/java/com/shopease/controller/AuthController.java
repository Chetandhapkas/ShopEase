package com.shopease.controller;

import com.shopease.model.User;
import com.shopease.repository.UserRepository;
import com.shopease.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${app.admin.init.secret:SHOPEASE_SUPER_ADMIN_2026}")
    private String adminInitSecret;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String fullName = request.get("fullName");
        String phone = request.get("phone");
        String adminSecretKey = request.get("adminSecretKey");

        if (email == null || password == null || fullName == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "Full name, email, and password are required");
            return ResponseEntity.badRequest().body(err);
        }

        if (userRepository.existsByEmail(email)) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "An account with this email address already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        }

        User.Role role = User.Role.USER;
        if (adminSecretKey != null && !adminSecretKey.isBlank()) {
            if (adminInitSecret.equals(adminSecretKey.trim())) {
                role = User.Role.ADMIN;
            } else {
                Map<String, Object> err = new HashMap<>();
                err.put("message", "Invalid admin initialization secret key");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            }
        }

        User newUser = User.builder()
                .fullName(fullName.trim())
                .email(email.trim().toLowerCase())
                .phone(phone)
                .password(passwordEncoder.encode(password))
                .role(role)
                .active(true)
                .build();

        User savedUser = userRepository.save(newUser);
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Account created successfully");
        response.put("token", token);
        response.put("user", savedUser);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        User user = userOpt.get();
        if (!user.isActive()) {
            Map<String, Object> err = new HashMap<>();
            err.put("message", "Your account has been deactivated. Please contact support.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
