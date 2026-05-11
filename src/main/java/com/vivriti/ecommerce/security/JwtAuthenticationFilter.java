package com.vivriti.ecommerce.security;

// runs on every request, validate and load the user
import com.vivriti.ecommerce.repository.AdminUserRepository;
import com.vivriti.ecommerce.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository,
            AdminUserRepository adminUserRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = extractToken(request);
        if (token != null && jwtService.isTokenValid(token)) {
            Claims claims = jwtService.parseClaims(token);
            String email = claims.getSubject();
            String role = Optional.ofNullable(claims.get("role", String.class)).orElse("USER");

            if ("ADMIN".equals(role)) {
                adminUserRepository.findByEmail(email).ifPresent(admin -> {
                    authenticateUser(admin, role, request);
                });
            } else {
                userRepository.findByEmail(email).ifPresent(user -> {
                    authenticateUser(user, role, request);
                });
            }
        } else {
            System.err.println("No valid token found in request to " + request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

    private void authenticateUser(org.springframework.security.core.userdetails.UserDetails userDetails, String role,
            HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null, // password is not needed
                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        System.err.println("Authenticated user: " + userDetails.getUsername() + ", Role: " + role + ", Authorities: "
                + authentication.getAuthorities());
    }

    private String extractToken(HttpServletRequest request) {
        // 1. Try Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring("Bearer ".length()).trim();
        }

        return null;
    }
}
