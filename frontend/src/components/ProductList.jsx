import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard';
import { deleteProduct, getProducts } from '../services/ProductService';
import ConfirmDialog from './ConfirmDialog';

const ProductList = ({ products, setProducts, viewMode = 'list' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmState, setConfirmState] = useState({ open: false, product: null });

  useEffect(() => {
    if (location.pathname === '/') {
      fetchProducts();
    }
  }, [location.key]);

  useEffect(() => {
    if (location.state && location.state.success) {
      setSuccessMessage(location.state.success);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 1000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [successMessage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (product) => {
    setConfirmState({ open: true, product });
  };

  const handleConfirmDelete = async () => {
    const product = confirmState.product;
    if (!product) {
      setConfirmState({ open: false, product: null });
      return;
    }

    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setSuccessMessage('Product deleted successfully.');
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete product');
    } finally {
      setConfirmState({ open: false, product: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmState({ open: false, product: null });
  };

  return (
    <>
      {successMessage && (
        <div className="success-banner">{successMessage}</div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">⚠️ {error}</p>
          <p className="error-hint">Make sure the Spring Boot backend is running on port 8080</p>
          <button className="retry-btn" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="empty-container">
          <p>No products available</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="products-container">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              onEdit={() => navigate(`/edit/${product.id}`)}
              onDelete={() => requestDelete(product)}
            />
          ))}
        </div>
      )}
    </>
    <ConfirmDialog
      open={confirmState.open}
      title="Delete product?"
      message={
        confirmState.product
          ? `Delete ${confirmState.product.name}? This cannot be undone.`
          : 'Delete this product? This cannot be undone.'
      }
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={handleConfirmDelete}
      onCancel={handleCancelDelete}
    />
  );
};

export default ProductList;
