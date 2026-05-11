import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  AutoComplete,
  Avatar,
  Badge,
  Button,
  Collapse,
  ConfigProvider,
  Empty,
  FloatButton,
  Input,
  Layout,
  message,
  Popover,
  Segmented,
  Row,
  Col,
  Select,
  Space,
  Spin,
  Typography,
  theme as antdTheme
} from 'antd';
import {
  CloseOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
  HeartOutlined,
  LeftOutlined,
  LogoutOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons';
import ProductCard from './ProductCard';
import AddProductPage from './AddProductPage';
import ProductDetailPage from './ProductDetailPage';
import AuthPage from './AuthPage';
import UsersPage from './UsersPage';
import UserDetailPage from './UserDetailPage';
import ProfilePage from './ProfilePage';
import WishlistPage from './WishlistPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import OrderHistoryPage from './OrderHistoryPage';
import OrderDetailPage from './OrderDetailPage'; // Import new page
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import ManageUsers from './ManageUsers';
import ManageOrders from './ManageOrders';
import ManageProducts from './ManageProducts';
import { getMe, logout, getCachedUserData } from './services/AuthService';
import { deleteProduct, getProducts, getRecommendedOnlyProducts, searchProducts } from './services/ProductService';
import { getAverageRatings } from './services/ReviewService';
import ConfirmDialog from './components/ConfirmDialog';
import { WishlistProvider, useWishlist } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const priceRangeLabels = {
  all: 'All',
  '1-5000': '₹1 - ₹5,000',
  '5001-10000': '₹5,001 - ₹10,000',
  '10001-15000': '₹10,001 - ₹15,000',
  '15001-20000': '₹15,001 - ₹20,000',
  '20001-50000': '₹20,001 - ₹50,000',
  '50001-100000': '₹50,001 - ₹1,00,000'
};

const priceOptions = [
  { value: 'all', label: 'All Prices' },
  { value: '1-5000', label: '₹1 - ₹5,000' },
  { value: '5001-10000', label: '₹5,001 - ₹10,000' },
  { value: '10001-15000', label: '₹10,001 - ₹15,000' },
  { value: '15001-20000', label: '₹15,001 - ₹20,000' },
  { value: '20001-50000', label: '₹20,001 - ₹50,000' },
  { value: '50001-100000', label: '₹50,001 - ₹1,00,000' }
];

const PrivateRoute = ({ children, currentUser, authBootstrapped = true }) => {
  if (!authBootstrapped) {
    return (
      <div className="centered" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" description="Verifying session..." />
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// Component to auto-load wishlist on home page
const WishlistLoader = ({ currentUser, isHomePage }) => {
  const { loadWishlist, fetched } = useWishlist();
  
  useEffect(() => {
    if (currentUser && isHomePage && !fetched) {
      loadWishlist();
    }
  }, [currentUser, isHomePage, fetched, loadWishlist]);
  
  return null;
};

function App() {
  const [products, setProducts] = useState([]);
  const [recommendedOnlyProducts, setRecommendedOnlyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterPanel, setActiveFilterPanel] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, product: null });
  const [currentUser, setCurrentUser] = useState(null);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [messageApi, messageContext] = message.useMessage();
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [productRatings, setProductRatings] = useState({});
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ecommerce-theme') || 'light';
  });
  const location = useLocation();
  const navigate = useNavigate();
  const lastFetchKeyRef = useRef(null);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ecommerce-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (location.pathname !== '/') {
      return;
    }

    if (lastFetchKeyRef.current === location.key) {
      return;
    }

    lastFetchKeyRef.current = location.key;
    const controller = new AbortController();
    fetchProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [location.key, location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setAppliedSearchQuery('');
      setCategoryFilter('all');
      setPriceRange('all');
      setShowFilters(false);
      setActiveFilterPanel(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.state && location.state.success) {
      setSuccessMessage(location.state.success);
      if (location.state.user) {
        console.log('Setting user from navigation state:', location.state.user);
        setCurrentUser(location.state.user);
        setAuthBootstrapped(true);
      }
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
  }, [successMessage]);

  // Bootstrap auth on app mount
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        // First, try to restore from cache for instant UI update
        const cachedUser = getCachedUserData();
        const token = localStorage.getItem('ecommerce-auth-token');

        if (cachedUser && cachedUser.email && token) {
          console.log('Restored user from cache (Skipping /me fetch):', cachedUser);
          setCurrentUser(cachedUser);
          setAuthBootstrapped(true);
          return;
        }

        // Then, verify with the server
        console.log('Bootstrapping auth from server...');
        const data = await getMe();
        console.log('getMe returned:', data);
        if (data && data.email) {
          setCurrentUser(data);
        } else if (!cachedUser) {
          // Only clear if we have no cache to fall back to
          setCurrentUser(null);
        }
        // If we have cached user but server returns nothing, keep the cached version
      } catch (err) {
        console.error('Error bootstrapping auth:', err);
        // On error, use cached user if available
        const cachedUser = getCachedUserData();
        if (!cachedUser || !cachedUser.email) {
          setCurrentUser(null);
        }
      } finally {
        setAuthBootstrapped(true);
      }
    };

    bootstrapAuth();
  }, []);

  const fetchProducts = async (signal) => {
    try {
      setLoading(true);
      const data = await getProducts(signal);

      if (signal?.aborted) return;

      setProducts(data);
      setError(null);

      const productIds = data.map((product) => product.id);
      if (productIds.length > 0) {
        try {
          // We can also pass signal to service if supported, but checking here is enough to stop the "bulk" call
          if (signal?.aborted) return;
          const ratings = await getAverageRatings(productIds, signal);

          if (signal?.aborted) return;
          setProductRatings(ratings || {});
        } catch {
          if (signal?.aborted) return;
          const fallbackRatings = productIds.reduce((acc, id) => {
            acc[id] = 0;
            return acc;
          }, {});
          setProductRatings(fallbackRatings);
        }
      } else {
        setProductRatings({});
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }

    try {
      if (signal?.aborted) return;
      const data = await getRecommendedOnlyProducts(signal);
      if (signal?.aborted) return;
      setRecommendedOnlyProducts(data);
    } catch (err) {
      if (!signal?.aborted) {
        setRecommendedOnlyProducts([]);
        console.error('Error fetching recommended products:', err);
      }
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

  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    if (!value || value.length < 1) {
      setSearchSuggestions([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await searchProducts(value);
      const suggestions = results.slice(0, 5).map(product => ({
        label: product.name,
        value: product.name
      }));
      setSearchSuggestions(suggestions);
    } catch {
      setSearchSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (value) => {
    const nextValue = value ?? searchQuery;
    setAppliedSearchQuery(nextValue);
    setSearchSuggestions([]);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    setSearchSuggestions([]);
  };

  const handleFilterOpenChange = (open) => {
    setShowFilters(open);
    if (!open) {
      setActiveFilterPanel(null);
    }
  };

  const applySorting = (productsToSort) => {
    let sorted = [...productsToSort];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      case 'popularity':
        return sorted.sort((a, b) => b.id - a.id); // Can be enhanced with view counts
      case 'rating-desc':
        return sorted.sort((a, b) => (productRatings[b.id] || 0) - (productRatings[a.id] || 0));
      default:
        return sorted;
    }
  };

  const handleBrandClick = () => {
    setSearchQuery('');
    setAppliedSearchQuery('');
    setCategoryFilter('all');
    setPriceRange('all');
    setShowFilters(false);
    setActiveFilterPanel(null);
    navigate('/');
  };

  const handleBrandKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleBrandClick();
    }
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(category);
    setActiveFilterPanel(null);
  };

  const handlePriceSelect = (range) => {
    setPriceRange(range);
    setActiveFilterPanel(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setCurrentUser(null);
      navigate('/auth');
    }
  };

  const requireLogin = (action) => {
    if (!currentUser) {
      messageApi.warning('Please login to perform this action.');
      return;
    }

    action();
  };

  const trimmedQuery = appliedSearchQuery.trim().toLowerCase();
  const normalizedCategory = categoryFilter.trim().toLowerCase();
  const [minPriceValue, maxPriceValue] = priceRange === 'all'
    ? [null, null]
    : priceRange.split('-').map((value) => Number(value));
  const activeFiltersCount = (
    (categoryFilter !== 'all' ? 1 : 0)
    + (priceRange !== 'all' ? 1 : 0)
  );
  const searchPool = trimmedQuery
    ? [...products, ...recommendedOnlyProducts]
    : products;
  const availableCategories = useMemo(() => (
    Array.from(new Set(searchPool.map((product) => product.category).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
  ), [searchPool]);
  const filteredProducts = applySorting(trimmedQuery
    ? searchPool.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(trimmedQuery);
      const categoryMatch = product.category.toLowerCase().includes(trimmedQuery);
      const queryMatch = nameMatch || categoryMatch;
      const filterCategoryMatch = normalizedCategory === 'all'
        || product.category.toLowerCase() === normalizedCategory;
      const priceMatch = (
        (minPriceValue === null || product.price >= minPriceValue)
        && (maxPriceValue === null || product.price <= maxPriceValue)
      );
      return queryMatch && filterCategoryMatch && priceMatch;
    })
    : products.filter((product) => {
      const filterCategoryMatch = normalizedCategory === 'all'
        || product.category.toLowerCase() === normalizedCategory;
      const priceMatch = (
        (minPriceValue === null || product.price >= minPriceValue)
        && (maxPriceValue === null || product.price <= maxPriceValue)
      );
      return filterCategoryMatch && priceMatch;
    }));

  const filterContent = (
    <div className="filter-popover">
      <Collapse
        accordion
        activeKey={activeFilterPanel}
        onChange={(key) => setActiveFilterPanel(key)}
        items={[
          {
            key: 'category',
            label: (
              <Space size="small">
                <span>Category</span>
                <Text type="secondary">
                  {categoryFilter === 'all' ? 'All' : categoryFilter}
                </Text>
              </Space>
            ),
            children: (
              <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                <Button
                  block
                  type={categoryFilter === 'all' ? 'primary' : 'text'}
                  onClick={() => handleCategorySelect('all')}
                >
                  All Categories
                </Button>
                {availableCategories.map((category) => (
                  <Button
                    key={category}
                    block
                    type={categoryFilter === category ? 'primary' : 'text'}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </Button>
                ))}
              </Space>
            )
          },
          {
            key: 'price',
            label: (
              <Space size="small">
                <span>Price Range</span>
                <Text type="secondary">
                  {priceRangeLabels[priceRange] || 'All'}
                </Text>
              </Space>
            ),
            children: (
              <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                {priceOptions.map((option) => (
                  <Button
                    key={option.value}
                    block
                    type={priceRange === option.value ? 'primary' : 'text'}
                    onClick={() => handlePriceSelect(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </Space>
            )
          },
          {
            key: 'sort',
            label: (
              <Space size="small">
                <span>Sort By</span>
                <Text type="secondary">
                  {sortBy === '' ? 'Relevance' : sortBy === 'price-asc' ? 'Price: Low to High' : sortBy === 'price-desc' ? 'Price: High to Low' : sortBy === 'newest' ? 'Newest' : sortBy === 'popularity' ? 'Popularity' : sortBy === 'rating-desc' ? 'Highest Rated' : 'Relevance'}
                </Text>
              </Space>
            ),
            children: (
              <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                <Button
                  block
                  type={sortBy === '' ? 'primary' : 'text'}
                  onClick={() => setSortBy('')}
                >
                  Relevance
                </Button>
                <Button
                  block
                  type={sortBy === 'price-asc' ? 'primary' : 'text'}
                  onClick={() => setSortBy('price-asc')}
                >
                  Price: Low to High
                </Button>
                <Button
                  block
                  type={sortBy === 'price-desc' ? 'primary' : 'text'}
                  onClick={() => setSortBy('price-desc')}
                >
                  Price: High to Low
                </Button>
                <Button
                  block
                  type={sortBy === 'newest' ? 'primary' : 'text'}
                  onClick={() => setSortBy('newest')}
                >
                  Newest
                </Button>
                <Button
                  block
                  type={sortBy === 'popularity' ? 'primary' : 'text'}
                  onClick={() => setSortBy('popularity')}
                >
                  Popularity
                </Button>
                <Button
                  block
                  type={sortBy === 'rating-desc' ? 'primary' : 'text'}
                  onClick={() => setSortBy('rating-desc')}
                >
                  Highest Rated
                </Button>
              </Space>
            )
          }
        ]}
      />
      {(activeFiltersCount > 0 || sortBy !== '') && (
        <Button
          danger
          block
          style={{ marginTop: 12 }}
          onClick={() => {
            setCategoryFilter('all');
            setPriceRange('all');
            setSortBy('');
          }}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          colorInfo: '#3b82f6',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          colorBgContainer: theme === 'dark' ? '#1f1f1f' : '#ffffff',
          colorBgElevated: theme === 'dark' ? '#262626' : '#ffffff',
          colorText: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)',
          colorTextSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
          colorTextTertiary: theme === 'dark' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
          colorBorder: theme === 'dark' ? '#424242' : '#d9d9d9'
        }
      }}
    >
      <WishlistProvider currentUser={currentUser}>
        <CartProvider currentUser={currentUser}>
          <WishlistLoader currentUser={currentUser} isHomePage={location.pathname === '/'} />
          <Layout className="app-shell">
          {messageContext}
          <Header className="app-header-bar">
            <div
              className="brand-block"
              onClick={handleBrandClick}
              onKeyDown={handleBrandKeyDown}
              role="button"
              tabIndex={0}
            >
              <Title level={3} className="brand-title">
                <span className="brand-link">E-Commerce Store</span>
              </Title>
              <Text type="secondary">Discover amazing products at great prices</Text>
            </div>
            <Space wrap className="header-controls">
              {location.pathname === '/' && (
                <Space>
                  <AutoComplete
                    className="search-input-antd"
                    value={searchQuery}
                    options={searchSuggestions}
                    onSearch={handleSearchChange}
                    onSelect={handleSearch}
                    placeholder="Search products by name"
                    notFoundContent={searchLoading ? <Spin size="small" /> : null}
                    style={{ width: 200 }}
                  />
                  {appliedSearchQuery && (
                    <Button icon={<CloseOutlined />} onClick={handleClearSearch}>
                      Clear
                    </Button>
                  )}
                </Space>
              )}
              {location.pathname === '/' && (
                <Popover
                  content={filterContent}
                  trigger="click"
                  open={showFilters}
                  onOpenChange={handleFilterOpenChange}
                  placement="bottomRight"
                >
                  <Badge count={activeFiltersCount} size="small" offset={[0, 2]}>
                    <Button
                      type={activeFiltersCount > 0 ? 'primary' : 'default'}
                      icon={<FilterOutlined />}
                    >
                      Filters
                    </Button>
                  </Badge>
                </Popover>
              )}
              {location.pathname === '/' && (
                <Segmented
                  className="view-toggle"
                  value={viewMode}
                  onChange={setViewMode}
                  options={[
                    {
                      value: 'grid',
                      label: (
                        <span className="segmented-icon">
                          <AppstoreOutlined />
                          <span className="sr-only">Grid</span>
                        </span>
                      )
                    },
                    {
                      value: 'list',
                      label: (
                        <span className="segmented-icon">
                          <BarsOutlined />
                          <span className="sr-only">List</span>
                        </span>
                      )
                    }
                  ]}
                />
              )}
              {currentUser && currentUser.role !== 'ADMIN' && (
                <Button icon={<HeartOutlined />} onClick={() => navigate('/wishlist')}>
                  My Wishlist
                </Button>
              )}
              {(currentUser?.role !== 'ADMIN' || location.pathname === '/') && currentUser?.role !== 'ADMIN' && location.pathname !== '/cart' && location.pathname !== '/auth' && (
                <Button icon={<ShoppingCartOutlined />} onClick={() => navigate('/cart')}>
                  Cart
                </Button>
              )}
              <Button 
                icon={theme === 'dark' ? <BulbFilled /> : <BulbOutlined />} 
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Button>
              {currentUser ? (
                <Popover
                  trigger="click"
                  placement="bottomRight"
                  content={(
                    <div className="account-popover">
                      <Button type="link" className="account-link" onClick={() => navigate('/profile')}>
                        <div className="account-row">
                          <Text strong>{currentUser.name || 'Account'}</Text>
                          <Text type="secondary">{currentUser.email}</Text>
                        </div>
                      </Button>
                      <Button className="account-action" onClick={() => navigate('/profile')} block>
                        Profile
                      </Button>
                      {currentUser.role === 'ADMIN' && (
                        <Button className="account-action" onClick={() => navigate('/admin')} block>
                          Dashboard
                        </Button>
                      )}

                      <Button className="account-action" icon={<LogoutOutlined />} onClick={handleLogout} block>
                        Logout
                      </Button>
                    </div>
                  )}
                >
                  <Button icon={<UserOutlined />}>
                    {currentUser.name || 'Account'}
                  </Button>
                </Popover>
              ) : location.pathname !== '/auth' && (
                <Button icon={<UserOutlined />} onClick={() => navigate('/auth')}>
                  Login
                </Button>
              )}
            </Space>
          </Header>

          <Content className="app-content">
            {successMessage && (
              <Alert title={successMessage} type="success" showIcon className="page-alert" />
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%' }}
              >
                <Routes location={location} key={location.pathname}>
                  <Route
                    path="/"
                    element={(
                      <>
                        {loading && (
                          <div className="centered">
                            <Spin description="Loading products..." size="large" />
                          </div>
                        )}

                        {!loading && error && (
                          <Alert
                            type="error"
                            title="Unable to load products"
                            description={(
                              <div>
                                <div>{error}</div>
                                <div>Make sure the Spring Boot backend is running on port 8080.</div>
                              </div>
                            )}
                            action={(
                              <Button icon={<ReloadOutlined />} onClick={fetchProducts}>
                                Retry
                              </Button>
                            )}
                            showIcon
                          />
                        )}

                        {!loading && !error && products.length === 0 && (
                          <Empty description="No products available" />
                        )}

                        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
                          <Empty description={`No products match "${appliedSearchQuery.trim()}"`} />
                        )}

                        {!loading && !error && filteredProducts.length > 0 && (
                          <Row gutter={[16, 16]} className={`product-grid ${viewMode}`}>
                            {filteredProducts.map((product, index) => {
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
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                                  >
                                    <ProductCard
                                      product={product}
                                      viewMode={viewMode}
                                      rating={ratingValue}
                                      ratingLoading={loading || !hasRating}
                                      currentUser={currentUser}
                                      onEdit={() => requireLogin(() => navigate(`/edit/${product.id}`))}
                                      onDelete={() => requireLogin(() => requestDelete(product))}
                                    />
                                  </motion.div>
                                </Col>
                              );
                            })}
                          </Row>
                        )}
                      </>
                    )}
                  />


            // ... existing code ...

                  <Route path="/add" element={<AddProductPage currentUser={currentUser} />} />
                  <Route path="/edit/:id" element={<AddProductPage currentUser={currentUser} />} />
                  <Route path="/product/:id" element={<ProductDetailPage currentUser={currentUser} />} />
                  <Route path="/users" element={<UsersPage currentUser={currentUser} />} />
                  <Route path="/users/:id" element={<UserDetailPage currentUser={currentUser} />} />
                  <Route path="/profile" element={
                    <PrivateRoute currentUser={currentUser} authBootstrapped={authBootstrapped}>
                      <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} />
                    </PrivateRoute>
                  } />
                  <Route path="/wishlist" element={<WishlistPage currentUser={currentUser} />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={
                    <PrivateRoute currentUser={currentUser} authBootstrapped={authBootstrapped}>
                      <OrderHistoryPage />
                    </PrivateRoute>
                  } />
                  <Route path="/orders/:id" element={
                    <PrivateRoute currentUser={currentUser} authBootstrapped={authBootstrapped}>
                      <OrderDetailPage />
                    </PrivateRoute>
                  } />
                  <Route path="/auth" element={<AuthPage />} />

                  <Route path="/admin" element={
                    <PrivateRoute currentUser={currentUser} authBootstrapped={authBootstrapped}>
                      <AdminLayout currentUser={currentUser} onLogout={handleLogout} />
                    </PrivateRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="orders" element={<ManageOrders />} />
                    <Route path="products" element={<ManageProducts />} />
                  </Route>
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Content>

          {location.pathname === '/' && currentUser?.role === 'ADMIN' && (
            <FloatButton
              type="primary"
              icon={<PlusOutlined />}
              tooltip="Add Product"
              onClick={() => navigate('/add')}
            />
          )}

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
        </Layout>
        </CartProvider>
      </WishlistProvider>
    </ConfigProvider>
  );
}

export default App;
