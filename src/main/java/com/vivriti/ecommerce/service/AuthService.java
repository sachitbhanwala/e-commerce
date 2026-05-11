package com.vivriti.ecommerce.service;

import com.vivriti.ecommerce.dto.AuthResponse;
import com.vivriti.ecommerce.dto.LoginRequest;
import com.vivriti.ecommerce.dto.SignupRequest;
import com.vivriti.ecommerce.model.AdminUser;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.model.UserRole;
import com.vivriti.ecommerce.repository.AdminUserRepository;
import com.vivriti.ecommerce.repository.UserRepository;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, AdminUserRepository adminUserRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<AuthResponse> signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail()) || adminUserRepository.existsByEmail(request.getEmail())) {
            return Optional.empty();
        }

        AppUser user = new AppUser();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        AppUser saved = userRepository.save(user);

        return Optional.of(new AuthResponse("Account created successfully.", saved.getEmail(), saved.getName(),
                saved.getRole(), null, null, null, null, null));
    }

    public Optional<AuthResponse> login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Check User table first
        Optional<AppUser> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return Optional
                        .of(new AuthResponse("Logged in successfully.", user.getEmail(), user.getName(), user.getRole(),
                                null, user.getAddress(), user.getCity(), user.getZip(), user.getShippingName()));
            }
        }

        // Check Admin table
        Optional<AdminUser> adminOpt = adminUserRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            if (passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
                return Optional.of(new AuthResponse("Admin logged in successfully.", admin.getEmail(), admin.getName(),
                        admin.getRole(),
                        null, null, null, null, null));
            }
        }

        return Optional.empty();
    }

}
