import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Rate, Space, Spin, Typography, Tooltip } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { getProductAverageRating } from './services/ReviewService';
import { useWishlist } from './contexts/WishlistContext';
import { motion } from 'framer-motion';
import './ProductCard.css';

const { Text, Paragraph } = Typography;

const ProductCard = ({ product, viewMode = 'grid', rating, ratingLoading, onEdit, onDelete, onRemoveFromWishlist, currentUser }) => {
  const navigate = useNavigate();
  const isList = viewMode === 'list';
  const [localRating, setLocalRating] = useState(0);
  const [localRatingLoading, setLocalRatingLoading] = useState(false);
  const hasExternalRating = typeof rating !== 'undefined' || typeof ratingLoading !== 'undefined';
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist && isInWishlist(product.id);
  const showWishlistIcon = currentUser && currentUser.role !== 'ADMIN';

  useEffect(() => {
    if (hasExternalRating) {
      return undefined;
    }

    let isActive = true;
    const loadRating = async () => {
      try {
        setLocalRatingLoading(true);
        const avg = await getProductAverageRating(product.id);
        if (isActive) {
          setLocalRating(avg || 0);
        }
      } catch {
        if (isActive) {
          setLocalRating(0);
        }
      } finally {
        if (isActive) {
          setLocalRatingLoading(false);
        }
      }
    };

    loadRating();

    return () => {
      isActive = false;
    };
  }, [product.id, hasExternalRating]);

  const displayRating = hasExternalRating ? (rating ?? 0) : localRating;
  const displayRatingLoading = hasExternalRating ? Boolean(ratingLoading) : localRatingLoading;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleWishlistToggle = async (event) => {
    event.stopPropagation();
    
    const wasWishlisted = isWishlisted;
    try {
      if (toggleWishlist) {
        await toggleWishlist(product);
        // If product was wishlisted and now removed, call the callback
        if (wasWishlisted && onRemoveFromWishlist) {
          onRemoveFromWishlist(product.id);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleActionClick = (event, action) => {
    event.stopPropagation();
    if (action) {
      action();
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
      <Card
        hoverable
        className={`product-card ${isList ? 'list' : 'grid'}`}
        cover={
          !isList ? (
            <img src={product.image} alt={product.name} className="product-card-image" />
          ) : null
        }
        onClick={handleCardClick}
        styles={isList ? { body: { padding: 16 } } : undefined}
      >
        {isList ? (
          <div className="product-card-list">
            <img src={product.image} alt={product.name} className="product-card-image-list" />
            <div className="product-card-list-body">
              <Space orientation="vertical" size={6} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{product.name}</Text>
                  {showWishlistIcon && (
                    <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                      <Button
                        type="text"
                        icon={isWishlisted
                          ? <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
                          : <HeartOutlined style={{ fontSize: '18px' }} />
                        }
                        onClick={handleWishlistToggle}
                        style={{ padding: '0 4px', height: 'auto', marginRight: '-8px' }}
                      />
                    </Tooltip>
                  )}
                </div>
                <Paragraph ellipsis={{ rows: 2 }} className="product-card-desc">
                  {product.shortDescription}
                </Paragraph>
                <Text strong className="product-card-price">₹{product.price.toFixed(2)}</Text>
                {displayRatingLoading ? (
                  <Spin size="small" />
                ) : displayRating > 0 ? (
                  <div className="product-card-rating">
                    <Rate disabled allowHalf value={displayRating} style={{ fontSize: 13 }} />
                    <Text type="secondary" style={{ marginLeft: 2, fontSize: 12 }}>
                      {displayRating.toFixed(1)}
                    </Text>
                  </div>
                ) : (
                  <Text type="secondary">No ratings</Text>
                )}
                {currentUser?.role === 'ADMIN' && (
                  <Space size="small">
                    <Button size="small" onClick={(event) => handleActionClick(event, onEdit)}>
                      Edit
                    </Button>
                    <Button size="small" danger onClick={(event) => handleActionClick(event, onDelete)}>
                      Delete
                    </Button>
                  </Space>
                )}
              </Space>
            </div>
          </div>
        ) : (
          <Space orientation="vertical" size={6} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>{product.name}</Text>
              {showWishlistIcon && (
                <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                  <Button
                    type="text"
                    icon={isWishlisted
                      ? <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} />
                      : <HeartOutlined style={{ fontSize: '18px' }} />
                    }
                    onClick={handleWishlistToggle}
                    style={{ padding: '0 4px', height: 'auto', marginRight: '-8px' }}
                  />
                </Tooltip>
              )}
            </div>
            <Paragraph ellipsis={{ rows: 2 }} className="product-card-desc">
              {product.shortDescription}
            </Paragraph>
            <Text strong className="product-card-price">₹{product.price.toFixed(2)}</Text>
            {displayRatingLoading ? (
              <Spin size="small" />
            ) : displayRating > 0 ? (
              <div className="product-card-rating">
                <Rate disabled allowHalf value={displayRating} style={{ fontSize: 13 }} />
                <Text type="secondary" style={{ marginLeft: 2, fontSize: 12 }}>
                  {displayRating.toFixed(1)}
                </Text>
              </div>
            ) : (
              <Text type="secondary">No rating</Text>
            )}
            {currentUser?.role === 'ADMIN' && (
              <Space size="small">
                <Button size="small" onClick={(event) => handleActionClick(event, onEdit)}>
                  Edit
                </Button>
                <Button size="small" danger onClick={(event) => handleActionClick(event, onDelete)}>
                  Delete
                </Button>
              </Space>
            )}
          </Space>
        )}
      </Card>
    </motion.div>
  );
};

export default ProductCard;
