import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Empty,
    Image,
    InputNumber,
    Layout,
    List,
    message,
    Row,
    Spin,
    Typography,
    Divider,
    Space
} from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowRightOutlined, ArrowLeftOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from './contexts/CartContext';

const { Title, Text } = Typography;
const { Content } = Layout;

const CartPage = () => {
    const { cartItems, loading, updateQuantity, removeFromCart, clearCart, cartTotal, loadCart } = useCart();
    const navigate = useNavigate();

    // Load cart on mount
    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const handleQuantityChange = async (productId, quantity) => {
        if (quantity < 1) return;
        await updateQuantity(productId, quantity);
    };

    const handleRemoveItem = async (productId) => {
        await removeFromCart(productId);
    };

    const handleClearCart = async () => {
        await clearCart();
    }

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="centered">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Layout className="layout">
            <Content style={{ padding: '0 50px', marginTop: 64 }}>
                <div className="site-layout-content">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(-1)}
                            style={{ marginRight: 16, border: 'none', background: 'transparent' }}
                        >
                            Go Back
                        </Button>
                        <Title level={2} style={{ margin: 0 }}><ShoppingCartOutlined /> Shopping Cart</Title>
                    </div>
                    {!cartItems || cartItems.length === 0 ? (
                        <Empty
                            description="Your cart is empty"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button type="primary" onClick={() => navigate('/')}>
                                Go Shopping
                            </Button>
                        </Empty>
                    ) : (
                        <Row gutter={24}>
                            <Col span={16}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={cartItems}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                >
                                                    Remove
                                                </Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<Image width={80} src={item.productImage} fallback="https://via.placeholder.com/80" />}
                                                title={<Text strong>{item.productName}</Text>}
                                                description={
                                                    <Space>
                                                        <Text>Price: ₹{item.price}</Text>
                                                        <Space>
                                                            <Text>Quantity:</Text>
                                                            <Space.Compact>
                                                                <Button
                                                                    icon={<MinusOutlined />}
                                                                    disabled={item.quantity <= 1}
                                                                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                                />
                                                                <InputNumber
                                                                    min={1}
                                                                    value={item.quantity}
                                                                    controls={false}
                                                                    onChange={(value) => handleQuantityChange(item.productId, value || 1)}
                                                                    style={{ width: '60px', textAlign: 'center' }}
                                                                />
                                                                <Button
                                                                    icon={<PlusOutlined />}
                                                                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                                />
                                                            </Space.Compact>
                                                        </Space>
                                                    </Space>
                                                }
                                            />
                                            <div style={{ textAlign: 'right' }}>
                                                <Title level={5}>₹{item.total}</Title>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                                <Button type="dashed" danger onClick={handleClearCart} style={{ marginTop: 16 }}>
                                    Clear Cart
                                </Button>
                            </Col>
                            <Col span={8}>
                                <Card title="Order Summary">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <Text>Subtotal</Text>
                                        <Text strong>₹{cartTotal.toFixed(2)}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <Text>Shipping</Text>
                                        <Text type="success">Free</Text>
                                    </div>
                                    <Divider />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                        <Title level={4}>Total</Title>
                                        <Title level={4}>₹{cartTotal.toFixed(2)}</Title>
                                    </div>
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        icon={<ArrowRightOutlined />}
                                        onClick={handleCheckout}
                                    >
                                        Proceed to Checkout
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default CartPage;
