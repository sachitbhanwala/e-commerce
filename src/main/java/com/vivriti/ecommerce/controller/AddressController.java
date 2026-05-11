package com.vivriti.ecommerce.controller;

import com.vivriti.ecommerce.dto.AddressRequest;
import com.vivriti.ecommerce.model.Address;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.service.AddressService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<Address>> getUserAddresses(
            org.springframework.security.core.Authentication authentication) {
        System.out.println("AddressController.getUserAddresses called");
        AppUser user = (AppUser) authentication.getPrincipal();
        return ResponseEntity.ok(addressService.getUserAddresses(user));
    }

    @PostMapping
    public ResponseEntity<Address> addAddress(org.springframework.security.core.Authentication authentication,
            @Valid @RequestBody AddressRequest request) {
        System.out.println("AddressController.addAddress called");
        AppUser user = (AppUser) authentication.getPrincipal();
        return ResponseEntity.ok(addressService.addAddress(user, request));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(org.springframework.security.core.Authentication authentication,
            @org.springframework.web.bind.annotation.PathVariable Long id) {
        AppUser user = (AppUser) authentication.getPrincipal();
        addressService.deleteAddress(user, id);
        return ResponseEntity.noContent().build();
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/default")
    public ResponseEntity<Void> setDefaultAddress(org.springframework.security.core.Authentication authentication,
            @org.springframework.web.bind.annotation.PathVariable Long id) {
        AppUser user = (AppUser) authentication.getPrincipal();
        addressService.setDefaultAddress(user, id);
        return ResponseEntity.ok().build();
    }
}
