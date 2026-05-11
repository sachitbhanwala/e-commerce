package com.vivriti.ecommerce.controller;

import com.vivriti.ecommerce.dto.AuthResponse;
import com.vivriti.ecommerce.dto.LoginRequest;
import com.vivriti.ecommerce.dto.SignupRequest;
import com.vivriti.ecommerce.model.AdminUser;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.security.JwtService;
import com.vivriti.ecommerce.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request,
            HttpServletResponse response) {
        Optional<AuthResponse> result = authService.signup(request);
        if (result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse("Email already registered.", null, null, null, null, null, null, null,
                            null));
        }

        AuthResponse authResponse = result.get();
        String token = jwtService.generateToken(authResponse.getEmail(), authResponse.getRole());
        return ResponseEntity.ok(new AuthResponse(authResponse.getMessage(), authResponse.getEmail(),
                authResponse.getName(), authResponse.getRole(), token, authResponse.getAddress(),
                authResponse.getCity(), authResponse.getZip(), authResponse.getShippingName()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        Optional<AuthResponse> result = authService.login(request);
        if (result.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Invalid email or password.", null, null, null, null, null, null, null,
                            null));
        }

        AuthResponse authResponse = result.get();
        String token = jwtService.generateToken(authResponse.getEmail(), authResponse.getRole());
        return ResponseEntity.ok(new AuthResponse(authResponse.getMessage(), authResponse.getEmail(),
                authResponse.getName(), authResponse.getRole(), token, authResponse.getAddress(),
                authResponse.getCity(), authResponse.getZip(), authResponse.getShippingName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
        return ResponseEntity.ok(new AuthResponse("Logged out.", null, null, null, null, null, null, null, null));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse("Not authenticated.", null, null, null, null, null, null, null, null));
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof AppUser user) {
            return ResponseEntity
                    .ok(new AuthResponse("Authenticated.", user.getEmail(), user.getName(), user.getRole(), null,
                            user.getAddress(), user.getCity(), user.getZip(), user.getShippingName()));
        } else if (principal instanceof AdminUser admin) {
            return ResponseEntity
                    .ok(new AuthResponse("Authenticated Admin.", admin.getEmail(), admin.getName(), admin.getRole(),
                            null,
                            null, null, null, null));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse("Not authenticated.", null, null, null, null, null, null, null, null));
    }
}
