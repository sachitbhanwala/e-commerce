package com.vivriti.ecommerce.service;

import com.vivriti.ecommerce.dto.UserDetailResponse;
import com.vivriti.ecommerce.dto.UserSelfUpdateRequest;
import com.vivriti.ecommerce.dto.UserSummaryResponse;
import com.vivriti.ecommerce.dto.UserUpdateRequest;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(AppUser::getId))
                .map(user -> new UserSummaryResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getCreatedAt()))
                .toList();
    }

    public Optional<UserDetailResponse> getUserDetail(Long id) {
        return userRepository.findById(id)
                .map(this::mapToDetail);
    }

    public Optional<UserDetailResponse> updateUser(Long id, UserUpdateRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setName(request.getName().trim());
                    user.setRole(request.getRole());
                    AppUser saved = userRepository.save(user);
                    return mapToDetail(saved);
                });
    }

    public UserDetailResponse getCurrentUserDetail(AppUser user) {
        return mapToDetail(user);
    }

    public UserDetailResponse updateCurrentUser(AppUser user, UserSelfUpdateRequest request) {
        user.setName(request.getName().trim());
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        AppUser saved = userRepository.save(user);
        return mapToDetail(saved);
    }

    private UserDetailResponse mapToDetail(AppUser user) {
        return new UserDetailResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getPhone(),
                user.getAddress(),
                user.getCity(),
                user.getZip(),
                user.getShippingName(),
                List.of());
    }
}
