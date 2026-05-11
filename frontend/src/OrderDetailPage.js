import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Result, Space, Spin, Table, Tag, Typography, Modal, message } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import OrderService from './services/OrderService';

const { Title, Text } = Typography;
const { confirm } = Modal;

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await OrderService.getOrderById(id);
            setOrder(data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load order details.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleCancelOrder = () => {
        confirm({
            title: 'Do you want to cancel this order?',
            icon: <ExclamationCircleFilled />,
            content: 'This action cannot be undone.',
            okText: 'Cancel Order',
            cancelText: 'Go Back',
            onOk: async () => {
                try {
                    setCancelling(true);
                    await OrderService.cancelOrder(id);
                    message.success('Order cancelled successfully');
                    fetchOrderDetails(); // Refresh details
                } catch (err) {
                    message.error('Failed to cancel order');
                } finally {
                    setCancelling(false);
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="centered">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-shell">
                <Alert type="error" message={error} showIcon />
                <Button style={{ marginTop: 16 }} onClick={() => navigate('/profile')}>Back to Profile</Button>
            </div>
        );
    }

    if (!order) {
        return <Result status="404" title="Order not found" />;
    }

    return (
        <div className="page-shell">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')} style={{ marginBottom: 16 }}>
                Back to Profile
            </Button>

            <Card title={<Title level={4} style={{ margin: 0 }}>Order #{order.id}</Title>}>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Date">
                        {new Date(order.orderDate).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={order.status === 'COMPLETED' ? 'green' : order.status === 'CANCELLED' ? 'red' : 'blue'}>
                            {order.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Amount">
                        <Text strong>₹{order.totalAmount}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Shipping Address">
                        {order.shippingAddress || 'Address not available'}
                    </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Items</Title>
                    <Table
                        dataSource={order.items}
                        rowKey="id"
                        pagination={false}
                        columns={[
                            {
                                title: 'Product',
                                dataIndex: 'productName',
                                key: 'productName',
                                render: (text, record) => (
                                    <Space>
                                        {record.productImage && <img src={record.productImage} alt={text} style={{ width: 40, height: 40, objectFit: 'cover' }} />}
                                        <Text>{text}</Text>
                                    </Space>
                                )
                            },
                            { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                            { title: 'Price', dataIndex: 'price', key: 'price', render: val => `₹${val}` },
                            { title: 'Total', dataIndex: 'total', key: 'total', render: val => `₹${val}` },
                        ]}
                    />
                </div>

                {order.status === 'PENDING' && (
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                        <Button danger onClick={handleCancelOrder} loading={cancelling}>
                            Cancel Order
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default OrderDetailPage;
