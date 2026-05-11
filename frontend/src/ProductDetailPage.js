import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Carousel, Col, Divider, Image, Result, Row, Space, Spin, Tag, Typography, message, InputNumber, Modal } from 'antd';
import { HeartOutlined, HeartFilled, MinusOutlined, PlusOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { deleteProduct, getRecommendedProducts, getProductDetails } from './services/ProductService';
import { getProductReviews, getProductAverageRating } from './services/ReviewService';
import { useWishlist } from './contexts/WishlistContext';
import { useCart } from './contexts/CartContext';
import ConfirmDialog from './components/ConfirmDialog';
import ReviewList from './components/ReviewList';
import { motion } from 'framer-motion';

// Product detail page component
const { Title, Text, Paragraph } = Typography;

const ProductDetailPage = ({ currentUser }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [messageApi, messageContext] = message.useMessage();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { isInWishlist, toggleWishlist, loading: globalWishlistLoading } = useWishlist();
  const { isInCart: isProductInCart, addToCart: addProductToCart } = useCart();

  const [cartLoading, setCartLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const carouselRef = React.useRef(null);
  const [addToCartAnimation, setAddToCartAnimation] = useState(false);

  const isWishlisted = isInWishlist && product ? isInWishlist(product.id) : false;
  const isInCart = product ? isProductInCart(product.id) : false;

  const requireLogin = (action) => {
    if (!currentUser) {
      messageApi.warning('Please login to perform this action.');
      return;
    }

    action();
  };

  const requestDelete = () => {
    if (!product) {
      return;
    }

    requireLogin(() => setConfirmOpen(true));
  };

  const handleConfirmDelete = async () => {
    if (!product) {
      setConfirmOpen(false);
      return;
    }

    try {
      await deleteProduct(product.id);
      navigate('/', {
        state: {
          success: 'Product deleted successfully.'
        }
      });
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete product.');
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  // User is passed as prop, no need to fetch separately

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('ecommerce-auth-token');

    // If we have a token but no user yet, wait for auth bootstrap to finish
    // This prevents a double-fetch (one anonymous, one authenticated) on page load
    if (token && !currentUser) {
      return;
    }

    const loadProductDetails = async () => {
      try {
        setLoading(true);
        // We always fetch fresh details to get everything in one go (reviews, rating, wishlist)
        // If we used stateProduct, we'd still need to fetch the others, destroying the "single request" goal.
        const data = await getProductDetails(id, controller.signal);

        if (controller.signal.aborted) return;

        setProduct(data.product);
        setMainImage(data.product.image);
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setError('');
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError.message || 'Something went wrong.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setReviewsLoading(false); // Ensure this is cleared too
        }
      }
    };

    loadProductDetails();

    return () => {
      controller.abort();
    };
  }, [id, currentUser]); // Re-fetch triggers if user logs in/out to update wishlist status

  useEffect(() => {
    let isActive = true;

    const loadRecommendations = async () => {
      if (!product) {
        return;
      }

      try {
        const data = await getRecommendedProducts(product.id);
        if (isActive) {
          setRecommendations(data);
        }
      } catch {
        if (isActive) {
          setRecommendations([]);
        }
      }
    };

    loadRecommendations();

    return () => {
      isActive = false;
    };
  }, [product]);

  const handleWishlistToggle = async () => {
    if (!currentUser) {
      messageApi.warning('Please login to add to wishlist');
      return;
    }
    try {
      if (toggleWishlist) await toggleWishlist(product);
    } catch (e) {
      console.error(e);
    }
  };

  const showQuantityModal = () => {
    if (!currentUser) {
      messageApi.warning('Please login to add to cart');
      return;
    }
    setQuantity(1); // Reset to default when opening
    setIsQuantityModalOpen(true);
  };

  const handleAddToCart = async () => {
    try {
      setCartLoading(true);
      const success = await addProductToCart(product.id, quantity);
      if (success) {
        setIsQuantityModalOpen(false);
        setAddToCartAnimation(true);
        setTimeout(() => setAddToCartAnimation(false), 600);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCartLoading(false);
    }
  };


  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }
    return [product.image, ...(product.imageUrls || [])];
  }, [product]);

  if (loading) {
    return (
      <div className="centered">
        <Spin description="Loading product..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Unable to load product"
        subTitle={error}
        extra={(
          <Button type="primary" onClick={() => navigate('/')}
          >
            Back to Products
          </Button>
        )}
      />
    );
  }

  if (!product) {
    return <Result status="404" title="Product not found" />;
  }

  return (
    <div className="product-detail-page">
      {messageContext}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card className="product-detail-card" variant="borderless">
            {galleryImages.length > 1 ? (
              <div className="product-carousel-container">
                <Carousel
                  ref={carouselRef}
                  dots={{ className: 'custom-carousel-dots' }}
                  arrows={true}
                  prevArrow={<Button icon={<LeftOutlined />} shape="circle" className="carousel-arrow" />}
                  nextArrow={<Button icon={<RightOutlined />} shape="circle" className="carousel-arrow" />}
                >
                  {galleryImages.map((image, index) => (
                    <div key={`${product.id}-carousel-${index}`}>
                      <Image
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        width="100%"
                        className="product-detail-image"
                        preview={{
                          src: image,
                        }}
                      />
                    </div>
                  ))}
                </Carousel>
                <Space className="product-detail-thumbs" size={12} style={{ marginTop: 16, display: 'flex', overflowX: 'auto', justifyContent: 'center' }}>
                  {galleryImages.map((image, index) => (
                    <img
                      key={`${product.id}-thumb-${index}`}
                      src={image}
                      alt={`${product.name} thumb ${index + 1}`}
                      width={72}
                      height={72}
                      className="product-detail-thumb"
                      onClick={() => carouselRef.current?.goTo(index)}
                      style={{
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '2px solid #d9d9d9',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '2px solid #1890ff';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '2px solid #d9d9d9';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </Space>
              </div>
            ) : (
              <Image
                src={mainImage || product.image}
                alt={product.name}
                width="100%"
                className="product-detail-image"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="product-detail-card" variant="borderless">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Title level={2} style={{ margin: 0 }}>{product.name}</Title>
              <Text className="product-detail-price">₹{product.price.toFixed(2)}</Text>
              <Space wrap>
                {currentUser?.role === 'ADMIN' && (
                  <>
                    <Button onClick={() => requireLogin(() => navigate(`/edit/${product.id}`))}>Edit</Button>
                    <Button danger onClick={requestDelete}>Delete</Button>
                  </>
                )}
                {currentUser?.role !== 'ADMIN' && (
                  <>
                    {isInCart ? (
                      <motion.div
                        animate={addToCartAnimation ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <Button type="primary" onClick={() => navigate('/cart')}>Go to Cart</Button>
                      </motion.div>
                    ) : (
                      <Button type="primary" onClick={showQuantityModal}>Add to Cart</Button>
                    )}
                    <Button
                      type={isWishlisted ? 'primary' : 'default'}
                      icon={isWishlisted ? <HeartFilled /> : <HeartOutlined />}
                      loading={globalWishlistLoading}
                      onClick={handleWishlistToggle}
                    >
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </Button>
                  </>
                )}
              </Space>
              <Divider />
              <Paragraph>{product.shortDescription}</Paragraph>
              <Paragraph type="secondary">{product.fullDescription}</Paragraph>
              {product.category && (
                <Tag color="blue">{product.category}</Tag>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card className="recommendations-card" variant="borderless">
        <Space orientation="vertical" size={8} style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>Recommended Products</Title>
          <Text type="secondary">Similar price and genre</Text>
        </Space>
        {recommendations.length === 0 ? (
          <Alert title="No recommendations available." type="info" showIcon />
        ) : (
          <div className="recommendations-scroll-bar">
            {recommendations.map((item) => (
              <Card
                key={item.id}
                hoverable
                className="recommendation-scroll-card"
                onClick={() => navigate(`/product/${item.id}`)}
                cover={<img src={item.image} alt={item.name} className="recommendation-image" />}
              >
                <Card.Meta
                  title={item.name}
                  description={`₹${item.price.toFixed(2)}`}
                />
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card className="reviews-card" variant="borderless">
        {reviewsLoading ? (
          <Spin description="Loading reviews..." />
        ) : (
          <ReviewList
            reviews={reviews}
            averageRating={averageRating}
            productId={product.id}
            currentUser={currentUser}
            onReviewAdded={async () => {
              const reviewsData = await getProductReviews(product.id);
              const ratingData = await getProductAverageRating(product.id);
              setReviews(reviewsData);
              setAverageRating(ratingData);
            }}
          />
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete product?"
        message="Delete this product? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <Modal
        title="Select Quantity"
        open={isQuantityModalOpen}
        onOk={handleAddToCart}
        onCancel={() => setIsQuantityModalOpen(false)}
        confirmLoading={cartLoading}
        okText="Confirm"
        width={350}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>How many of this item would you like to add to your cart?</Text>
          <Space.Compact>
            <Button
              icon={<MinusOutlined />}
              disabled={quantity <= 1}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            />
            <InputNumber
              min={1}
              max={99}
              value={quantity}
              controls={false}
              onChange={(value) => setQuantity(value || 1)}
              style={{ width: '60px', textAlign: 'center' }}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
            />
          </Space.Compact>
        </Space>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
