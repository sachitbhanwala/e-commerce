package com.vivriti.ecommerce.service;

import com.vivriti.ecommerce.dto.AddressRequest;
import com.vivriti.ecommerce.model.Address;
import com.vivriti.ecommerce.model.AppUser;
import com.vivriti.ecommerce.repository.AddressRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AddressService {
    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<Address> getUserAddresses(AppUser user) {
        return addressRepository.findByUserId(user.getId());
    }

    public Address addAddress(AppUser user, AddressRequest request) {
        List<Address> userAddresses = addressRepository.findByUserId(user.getId());
        boolean isFirstAddress = userAddresses.isEmpty();

        Address address = new Address();
        address.setUser(user);
        address.setFullName(request.getFullName());
        address.setAddress(request.getAddress());
        address.setCity(request.getCity());
        address.setZip(request.getZip());
        address.setDefault(isFirstAddress); // Make default if it's the first one

        return addressRepository.save(address);
    }

    public void deleteAddress(AppUser user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this address");
        }

        addressRepository.delete(address);
    }

    public void setDefaultAddress(AppUser user, Long addressId) {
        List<Address> userAddresses = addressRepository.findByUserId(user.getId());

        Address newDefault = null;
        for (Address addr : userAddresses) {
            if (addr.getId().equals(addressId)) {
                newDefault = addr;
            } else if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr); // Remove default from others
            }
        }

        if (newDefault == null) {
            throw new RuntimeException("Address not found or doesn't belong to the user");
        }

        newDefault.setDefault(true);
        addressRepository.save(newDefault);
    }
}
