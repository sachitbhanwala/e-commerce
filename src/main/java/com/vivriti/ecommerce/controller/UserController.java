package com.vivriti.ecommerce.controller;

import com.vivriti.ecommerce.dto.UserDetailResponse;
import com.vivriti.ecommerce.dto.UserSelfUpdateRequest;
import com.vivriti.ecommerce.dto.UserSummaryResponse;
import com.vivriti.ecommerce.dto.UserUpdateRequest;
import com.vivriti.ecommerce.model.AppUser;
import jakarta.validation.Valid;
import com.vivriti.ecommerce.service.UserService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@org.springframework.web.bind.annotation.CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummaryResponse> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDetailResponse> getCurrentUser(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (userDetails instanceof AppUser) {
            return ResponseEntity.ok(userService.getCurrentUserDetail((AppUser) userDetails));
        } else if (userDetails instanceof com.vivriti.ecommerce.model.AdminUser) {
            com.vivriti.ecommerce.model.AdminUser admin = (com.vivriti.ecommerce.model.AdminUser) userDetails;
            return ResponseEntity.ok(new UserDetailResponse(
                    admin.getId(),
                    admin.getName(),
                    admin.getEmail(),
                    admin.getRole(),
                    null, // createdAt
                    null, // phone
                    null, // address
                    null, // city
                    null, // zip
                    null, // shippingName
                    java.util.Collections.emptyList() // orders
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/me")
    public ResponseEntity<UserDetailResponse> updateCurrentUser(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @Valid @RequestBody UserSelfUpdateRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (userDetails instanceof AppUser) {
            return ResponseEntity.ok(userService.updateCurrentUser((AppUser) userDetails, request));
        }

        // Admins aren't allowed to edit their profile from the regular UI
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDetailResponse> getUser(@PathVariable Long id) {
        return userService.getUserDetail(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDetailResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return userService.updateUser(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
