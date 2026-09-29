package com.se2012.physicsforlife.controller;

import com.se2012.physicsforlife.entity.AppUser;
import com.se2012.physicsforlife.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint to create a new user
    @PostMapping("/register")
    public ResponseEntity<AppUser> registerUser(@RequestBody AppUser user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    // Endpoint to fetch all users
    @GetMapping
    public ResponseEntity<List<AppUser>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AppUser loginRequest) {
        AppUser validUser = userService.loginUser(loginRequest.getEmail(), loginRequest.getPasswordHash());

        if (validUser != null) {
            return ResponseEntity.ok(validUser);
        } else {
            // Returns a 401 Unauthorized status if the login fails
            return ResponseEntity.status(401).body("{\"error\": \"Invalid email or password\"}");
        }
    }
}