package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.AppUser;
import com.se2012.physicsforlife.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AppUser registerUser(AppUser user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("A user with this email already exists!");
        }
        return userRepository.save(user);
    }

    // NEW: Safe update method for login timestamp and existing users
    public AppUser updateUser(AppUser user) {
        return userRepository.save(user);
    }

    public Optional<AppUser> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public AppUser loginUser(String email, String password) {
        AppUser user = userRepository.findByEmail(email).orElse(null);
        if (user != null && user.getPasswordHash().equals(password)) {
            return user;
        }
        return null;
    }
}