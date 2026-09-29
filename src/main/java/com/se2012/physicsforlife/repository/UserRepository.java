package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {

    // Spring Boot automatically writes the SQL query to find a user by their email!
    Optional<AppUser> findByEmail(String email);

    // Checks if an email already exists in the database
    boolean existsByEmail(String email);
}