package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.AppUser;
import com.se2012.physicsforlife.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Spring Boot automatically injects the UserRepository here
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 1. Register a new user with validation
    public AppUser registerUser(AppUser user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("A user with this email already exists!");
        }
        return userRepository.save(user);
    }

    // 2. Fetch a single user by their ID
    public Optional<AppUser> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // 3. Fetch all registered users
    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }
}