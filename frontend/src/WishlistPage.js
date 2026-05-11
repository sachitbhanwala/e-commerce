import React, { useEffect, useState } from 'react';
import { Button, Col, Empty, Layout, message, Result, Row, Segmented, Space, Spin, Typography } from 'antd';
import { LeftOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { getMyWishlist } from './services/WishlistService';
import { deleteProduct } from './services/ProductService';
import { getAverageRatings } from './services/ReviewService';
import ProductCard from './ProductCard';
import ConfirmDialog from './components/ConfirmDialog';
import './App.css';

const { Content } = Layout;
const { Title } = Typography;

const WishlistPage = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [messageApi, messageContext] = message.useMessage();
  const [confirmState, setConfirmState] = useState({ open: false, product: null });
  const [productRatings, setProductRatings] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const loadWishlist = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Pass signal if getMyWishlist supports it (it doesn't yet, but good practice for future)
        // For now, checks are manual
        const data = await getMyWishlist();

        if (controller.signal.aborted) return;

        setProducts(data);
        setError(null);

        const productIds = data.map((p) => p.id);
        if (productIds.length > 0) {
          try {
            const ratings = await getAverageRatings(productIds, controller.signal);
            if (!controller.signal.aborted) {
              setProductRatings(ratings || {});
            }
          } catch (ratingError) {
            if (!controller.signal.aborted) {
              console.error('Failed to load ratings', ratingError);
            }
          }
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError.message || 'Failed to load wishlist');
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      controller.abort();
    };
  }, [currentUser]);

  const requireLogin = (callback) => {
    if (!currentUser) {
      messageApi.warning('Please login first');
      return;
    }
    callback();
  };


  const requestDelete = (product) => {
    setConfirmState({ open: true, product });
  };

  const handleConfirmDelete = async () => {
    const productToDelete = confirmState.product;
    setConfirmState({ open: false, product: null });

    try {
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      messageApi.success('Product deleted successfully');
    } catch (err) {
      messageApi.error(err.message || 'Failed to delete product');
    }
  };

  const handleCancelDelete = () => {
    setConfirmState({ open: false, product: null });
  };

  const handleRemoveFromWishlist = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    messageApi.success('Removed from wishlist');
  };

  if (!currentUser) {
    return (
      <Content className="page-content">
        <Result
          status="403"
          title="Access Denied"
          subTitle="Please login to view your wishlist."
          extra={
            <Button type="primary" onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          }
        />
      </Content>
    );
  }

  return (
    <>
      {messageContext}
      <Content className="page-content">
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button icon={<LeftOutlined />} onClick={() => navigate('/')} />
              <Title level={2} style={{ margin: 0 }}>
                My Wishlist
              </Title>
            </div>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { label: 'Grid', icon: <AppstoreOutlined />, value: 'grid' },
                { label: 'List', icon: <BarsOutlined />, value: 'list' }
              ]}
            />
          </div>

          {loading ? (
            <Spin size="large" style={{ display: 'flex', justifyContent: 'center', minHeight: '400px', alignItems: 'center' }} />
          ) : error ? (
            <Result
              status="error"
              title="Failed to Load"
              subTitle={error}
              extra={
                <Button type="primary" onClick={() => navigate('/')}>
                  Go Home
                </Button>
              }
            />
          ) : products.length === 0 ? (
            <Empty
              description="Your wishlist is empty"
              style={{ marginTop: '50px' }}
              extra={
                <Button type="primary" onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
              }
            />
          ) : (
            <Row gutter={[16, 16]} className={`product-grid ${viewMode}`}>
              {products.map((product) => {
                const hasRating = Object.prototype.hasOwnProperty.call(productRatings, product.id);
                const ratingValue = hasRating ? productRatings[product.id] : 0;

                return (
                  <Col
                    key={`prod-${product.id}`}
                    xs={24}
                    sm={viewMode === 'list' ? 24 : 12}
                    md={viewMode === 'list' ? 24 : 8}
                    lg={viewMode === 'list' ? 24 : 6}
                  >
                    <ProductCard
                      product={product}
                      viewMode={viewMode}
                      rating={ratingValue}
                      ratingLoading={loading || !hasRating}
                      onEdit={() => requireLogin(() => navigate(`/edit/${product.id}`))}
                      onDelete={() => requireLogin(() => requestDelete(product))}
                      onRemoveFromWishlist={handleRemoveFromWishlist}
                      currentUser={currentUser}
                    />
                  </Col>
                );
              })}
            </Row>
          )}
        </Space>

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
      </Content>
    </>
  );
};

export default WishlistPage;
