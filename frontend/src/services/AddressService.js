import { API_BASE_URL, getAuthHeader } from './AuthService';

const AddressService = {
    getUserAddresses: async () => {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) throw new Error('Failed to fetch addresses');
        return response.json();
    },

    addAddress: async (addressRequest) => {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(addressRequest)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to add address: ${response.status} ${errorText}`);
        }
        return response.json();
    },

    deleteAddress: async (addressId) => {
        const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete address: ${response.status} ${errorText}`);
        }
    },

    setDefaultAddress: async (addressId) => {
        const response = await fetch(`${API_BASE_URL}/addresses/${addressId}/default`, {
            method: 'PUT',
            headers: {
                ...getAuthHeader()
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to set default address: ${response.status} ${errorText}`);
        }
    }
};

export default AddressService;
