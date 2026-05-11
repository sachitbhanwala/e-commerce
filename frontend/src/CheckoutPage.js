import React, { useState } from 'react';
import {
    Button,
    Card,
    Form,
    Input,
    Layout,
    message,
    Result,
    Steps,
    Typography,
    Radio,
    Divider,
    Space
} from 'antd';
import { CheckCircleOutlined, CreditCardOutlined, SolutionOutlined, TagOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

import { getMyProfile } from './services/UserService';
import AddressService from './services/AddressService';
import OrderService from './services/OrderService';
import { useCart } from './contexts/CartContext';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Step } = Steps;

const CheckoutPage = () => {
    const { cartTotal: contextCartTotal, cartItems, loadCart } = useCart();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [cartTotal, setCartTotal] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize from CartPage state if available
    const initialPromo = location.state?.appliedPromo || '';
    const [promoCodeInput, setPromoCodeInput] = useState(initialPromo);
    const [appliedPromo, setAppliedPromo] = useState(initialPromo);
    const [discountAmount, setDiscountAmount] = useState(0);

    const [form] = Form.useForm();

    const [shippingDetails, setShippingDetails] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [showNewAddressForm, setShowNewAddressForm] = useState(false);

    React.useEffect(() => {
        loadCart(); // Load cart data
        fetchData();
    }, [loadCart]);

    const fetchData = async () => {
        try {
            const [addresses, userProfile] = await Promise.all([
                AddressService.getUserAddresses(),
                getMyProfile()
            ]);

            setCartTotal(contextCartTotal || 0);

            let allAddresses = [...addresses];

            // If user has a profile address, adding it as a temporary option if not already saved
            if (userProfile.address) {
                const profileAddress = {
                    id: 'profile-default',
                    fullName: userProfile.shippingName || userProfile.name,
                    address: userProfile.address,
                    city: userProfile.city,
                    zip: userProfile.zip,
                    isProfile: true
                };
                // Check if this address is essentially already in the list to avoid duplicates (simple check)
                const isDuplicate = addresses.some(a =>
                    a.address === profileAddress.address &&
                    a.city === profileAddress.city &&
                    a.zip === profileAddress.zip
                );

                if (!isDuplicate) {
                    allAddresses = [profileAddress, ...addresses];
                }
            }

            setSavedAddresses(allAddresses);

            if (allAddresses.length > 0) {
                const defaultAddr = allAddresses.find(a => a.default || a.isDefault);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                    setShippingDetails(defaultAddr);
                } else {
                    setSelectedAddressId(allAddresses[0].id);
                    setShippingDetails(allAddresses[0]);
                }
            } else {
                setShowNewAddressForm(true);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const handleAddressSelect = (e) => {
        const value = e.target.value;
        setSelectedAddressId(value);
        const addr = savedAddresses.find(a => a.id === value);
        if (addr) {
            setShippingDetails(addr);
            setShowNewAddressForm(false);
        }
    };

    const toggleNewAddressForm = () => {
        setShowNewAddressForm(true);
        setSelectedAddressId(null);
        setShippingDetails(null);
        form.resetFields();
    };

    const onAddressFinish = async (values) => {
        try {
            const newAddr = await AddressService.addAddress(values);
            setSavedAddresses([...savedAddresses, newAddr]);
            setSelectedAddressId(newAddr.id);
            setShippingDetails(newAddr);
            setCurrentStep(1);
            setShowNewAddressForm(false);
            message.success('Address saved!');
        } catch (error) {
            console.error('Address save error:', error);
            message.error('Failed to save address: ' + error.message);
        }
    };

    const handleProceedWithSelectedAddress = () => {
        if (!shippingDetails && selectedAddressId && selectedAddressId !== 'new') {
            const addr = savedAddresses.find(a => a.id === selectedAddressId);
            setShippingDetails(addr);
        }
        if (shippingDetails) {
            setCurrentStep(1);
        } else {
            message.error('Please select or add a shipping address.');
        }
    };



    const calculateDiscount = (total, code) => {
        if (!code) {
            setDiscountAmount(0);
            return;
        }

        const upperCode = code.toUpperCase();
        if (upperCode === 'WELCOME10') {
            setDiscountAmount(total * 0.10);
        } else if (upperCode === 'FLAT50') {
            setDiscountAmount(Math.min(total, 50));
        } else {
            setDiscountAmount(0);
        }
    };

    const handleApplyPromo = () => {
        const code = promoCodeInput.trim().toUpperCase();
        if (!code) return;

        if (code === 'WELCOME10' || code === 'FLAT50') {
            setAppliedPromo(code);
            calculateDiscount(cartTotal, code);
            message.success('Promo code applied successfully!');
        } else {
            message.error('Invalid promo code');
            setAppliedPromo(null);
            setDiscountAmount(0);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCodeInput('');
        setDiscountAmount(0);
        message.info('Promo code removed');
    };

    const handlePlaceOrder = async () => {
        if (!shippingDetails) {
            message.error('Please complete shipping details first.');
            setCurrentStep(0);
            return;
        }

        try {
            setLoading(true);
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            const orderRequest = {
                fullName: shippingDetails.fullName,
                address: shippingDetails.address,
                city: shippingDetails.city,
                zip: shippingDetails.zip,
                paymentMethod: 'Credit Card', // Mock
                promoCode: appliedPromo // Use the actually applied code, not just typed input
            };

            const order = await OrderService.placeOrder(orderRequest);
            setOrderId(order.id);
            setCurrentStep(2);
            message.success('Order placed successfully!');
        } catch (error) {
            console.error('Failed to place order:', error);
            message.error('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    const steps = [
        {
            title: 'Shipping',
            icon: <SolutionOutlined />,
            content: (
                <div>
                    {!showNewAddressForm && (
                        <>
                            <Radio.Group onChange={handleAddressSelect} value={selectedAddressId} style={{ width: '100%', marginBottom: 16 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {savedAddresses.map(addr => (
                                        <Radio value={addr.id} key={addr.id}>
                                            <Card size="small" style={{ width: 600 }}>
                                                <Text strong>
                                                    {addr.fullName}
                                                    {addr.isProfile ? ' (Default Profile Address)' : ''}
                                                    {(addr.default || addr.isDefault) ? ' (Default)' : ''}
                                                </Text><br />
                                                <Text>{addr.address}, {addr.city}, {addr.zip}</Text>
                                            </Card>
                                        </Radio>
                                    ))}
                                </Space>
                            </Radio.Group>

                            <Button onClick={toggleNewAddressForm} style={{ marginBottom: 16 }}>
                                + Add New Address
                            </Button>

                            <br />

                            <Button type="primary" onClick={handleProceedWithSelectedAddress} disabled={!selectedAddressId}>
                                Continue to Payment
                            </Button>
                        </>
                    )}

                    {showNewAddressForm && (
                        <Card title="Add New Address" size="small">
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onAddressFinish}
                            >
                                <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: 'Please enter your name' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Address" name="address" rules={[{ required: true, message: 'Please enter your address' }]}>
                                    <Input.TextArea rows={3} />
                                </Form.Item>
                                <Form.Item label="City" name="city" rules={[{ required: true, message: 'Please enter your city' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Zip Code" name="zip" rules={[{ required: true, message: 'Please enter zip code' }]}>
                                    <Input />
                                </Form.Item>

                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        Save & Use This Address
                                    </Button>
                                    {savedAddresses.length > 0 && (
                                        <Button onClick={() => setShowNewAddressForm(false)}>
                                            Cancel
                                        </Button>
                                    )}
                                </Space>
                            </Form>
                        </Card>
                    )}
                </div>
            )
        },
        {
            title: 'Payment',
            icon: <CreditCardOutlined />,
            content: (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Title level={4}>Payment Method</Title>
                    <Text>For this demo, we are using a mock payment gateway.</Text>
                    <Divider />
                    <div style={{ marginBottom: 20 }}>
                        <CreditCardOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                        <div style={{ marginTop: 10 }}><Text strong>Mock Card ending in 4242</Text></div>
                        <Divider />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', maxWidth: '300px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                                <Text>Subtotal:</Text>
                                <Text>₹{cartTotal.toFixed(2)}</Text>
                            </div>

                            <div style={{ width: '100%', marginBottom: 8 }}>
                                {!appliedPromo ? (
                                    <Space.Compact style={{ width: '100%' }}>
                                        <Input
                                            placeholder="Promo code"
                                            value={promoCodeInput}
                                            onChange={(e) => setPromoCodeInput(e.target.value)}
                                            onPressEnter={handleApplyPromo}
                                            prefix={<TagOutlined />}
                                        />
                                        <Button type="primary" onClick={handleApplyPromo}>Apply</Button>
                                    </Space.Compact>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6ffed', padding: '8px 12px', borderRadius: '4px', border: '1px solid #b7eb8f' }}>
                                        <Space>
                                            <TagOutlined style={{ color: '#52c41a' }} />
                                            <Text strong type="success">{appliedPromo}</Text>
                                        </Space>
                                        <Button type="text" size="small" danger onClick={handleRemovePromo}>Remove</Button>
                                    </div>
                                )}
                            </div>

                            {appliedPromo && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                                    <Text type="success">Discount:</Text>
                                    <Text type="success" strong>-₹{discountAmount.toFixed(2)}</Text>
                                </div>
                            )}

                            <Divider style={{ margin: '8px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
                                <Title level={4} style={{ margin: 0 }}>Total to Pay:</Title>
                                <Title level={4} style={{ margin: 0 }}>₹{Math.max(0, cartTotal - discountAmount).toFixed(2)}</Title>
                            </div>
                        </div>
                    </div>
                    <Button type="primary" size="large" onClick={handlePlaceOrder} loading={loading}>
                        Pay & Place Order
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={() => setCurrentStep(0)} disabled={loading}>
                        Back
                    </Button>
                </div>
            )
        },
        {
            title: 'Done',
            icon: <CheckCircleOutlined />,
            content: (
                <Result
                    status="success"
                    title="Successfully Purchased"
                    subTitle={`Order number: ${orderId} Cloud server configuration takes 1-5 minutes, please wait.`}
                    extra={[
                        <Button type="primary" key="console" onClick={() => navigate('/orders')}>
                            Go to Order History
                        </Button>,
                        <Button key="buy" onClick={() => navigate('/')}>
                            Buy Again
                        </Button>,
                    ]}
                />
            )
        }
    ];

    return (
        <Layout className="layout">
            <Content style={{ padding: '0 50px', marginTop: 64 }}>
                <div className="site-layout-content" style={{ maxWidth: 800, margin: '0 auto' }}>
                    <Title level={2}>Checkout</Title>
                    <Card>
                        <Steps current={currentStep}>
                            {steps.map(item => (
                                <Step key={item.title} title={item.title} icon={item.icon} />
                            ))}
                        </Steps>
                        <div className="steps-content" style={{ marginTop: 24, minHeight: 200 }}>
                            {steps[currentStep].content}
                        </div>
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default CheckoutPage;
