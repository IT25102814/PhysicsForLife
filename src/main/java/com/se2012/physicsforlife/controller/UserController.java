package com.se2012.physicsforlife.controller;

import com.se2012.physicsforlife.entity.AccountStatus;
import com.se2012.physicsforlife.entity.AppUser;
import com.se2012.physicsforlife.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AppUser> registerUser(@RequestBody AppUser user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @GetMapping
    public ResponseEntity<List<AppUser>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody AppUser loginRequest) {
        AppUser validUser = userService.loginUser(loginRequest.getEmail(), loginRequest.getPasswordHash());

        if (validUser != null) {
            // Check if account is suspended
            if (validUser.getAccountStatus() == AccountStatus.SUSPENDED) {
                return ResponseEntity.status(403).body("{\"error\": \"Account is suspended. Contact administrator.\"}");
            }

            // Update last login timestamp
            validUser.setLastLoginAt(LocalDateTime.now());
            userService.updateUser(validUser);

            return ResponseEntity.ok(validUser);
        } else {
            return ResponseEntity.status(401).body("{\"error\": \"Invalid email or password.\"}");
        }
    }

    // --- MEMBER 1: ADMIN MANAGEMENT & STATUS CONTROL ENDPOINTS ---

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestParam AccountStatus status) {
        List<AppUser> users = userService.getAllUsers();
        AppUser targetUser = users.stream().filter(u -> u.getUserId().equals(id)).findFirst().orElse(null);

        if (targetUser != null) {
            targetUser.setAccountStatus(status);
            userService.updateUser(targetUser);
            return ResponseEntity.ok("User status updated to " + status);
        }
        return ResponseEntity.status(404).body("User not found");
    }

    // --- MEMBER 1: ADMIN DIRECT USER EDIT ENDPOINT (WITH DUPLICATE EMAIL CHECK) ---
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> adminUpdateUser(@PathVariable Long id, @RequestBody AppUser updatedDetails) {
        List<AppUser> users = userService.getAllUsers();
        AppUser targetUser = users.stream().filter(u -> u.getUserId().equals(id)).findFirst().orElse(null);

        if (targetUser == null) {
            return ResponseEntity.status(404).body("{\"error\": \"User not found\"}");
        }

        // Check if email is already taken by another user
        boolean emailTaken = users.stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(updatedDetails.getEmail()) && !u.getUserId().equals(id));
        if (emailTaken) {
            return ResponseEntity.status(400).body("{\"error\": \"Email address is already in use by another user.\"}");
        }

        targetUser.setFullName(updatedDetails.getFullName());
        targetUser.setEmail(updatedDetails.getEmail());
        targetUser.setPhone(updatedDetails.getPhone());
        targetUser.setRole(updatedDetails.getRole());

        // Update password if a new one is provided by the admin
        if (updatedDetails.getPasswordHash() != null && !updatedDetails.getPasswordHash().trim().isEmpty()) {
            targetUser.setPasswordHash(updatedDetails.getPasswordHash());
        }

        userService.updateUser(targetUser);
        return ResponseEntity.ok(targetUser);
    }

    // --- MEMBER 1: USER PROFILE UPDATE ENDPOINT WITH PASSWORD & EMAIL VERIFICATION ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody Map<String, String> updateRequest) {
        List<AppUser> users = userService.getAllUsers();
        AppUser targetUser = users.stream().filter(u -> u.getUserId().equals(id)).findFirst().orElse(null);

        if (targetUser == null) {
            return ResponseEntity.status(404).body("{\"error\": \"User not found\"}");
        }

        String fullName = updateRequest.get("fullName");
        String email = updateRequest.get("email");
        String phone = updateRequest.get("phone");
        String currentPassword = updateRequest.get("currentPassword");
        String newPassword = updateRequest.get("newPassword");

        // Check if email is already taken by another user
        boolean emailTaken = users.stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(email) && !u.getUserId().equals(id));
        if (emailTaken) {
            return ResponseEntity.status(400).body("{\"error\": \"Email address is already in use by another account.\"}");
        }

        // If a new password is provided, verify the current password first
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            if (currentPassword == null || !currentPassword.equals(targetUser.getPasswordHash())) {
                return ResponseEntity.status(400).body("{\"error\": \"Incorrect current password.\"}");
            }
            targetUser.setPasswordHash(newPassword);
        }

        targetUser.setFullName(fullName);
        targetUser.setEmail(email);
        targetUser.setPhone(phone);

        userService.updateUser(targetUser);
        return ResponseEntity.ok(targetUser);
    }
}