import React, { useEffect, useState } from 'react';
import {
    Layout,
    Table,
    Tag,
    Typography,
    Button,
    Modal,
    message
} from 'antd';
import { ShoppingOutlined, DownOutlined, UpOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import OrderService from './services/OrderService';

const { Title, Text } = Typography;
const { Content } = Layout;

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await OrderService.getUserOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const [cancellingId, setCancellingId] = useState(null);

    const handleCancelOrder = (orderId) => {
        Modal.confirm({
            title: 'Do you want to cancel this order?',
            icon: <ExclamationCircleFilled />,
            content: 'This action cannot be undone.',
            okText: 'Cancel Order',
            okType: 'danger',
            cancelText: 'Go Back',
            onOk: async () => {
                try {
                    setCancellingId(orderId);
                    await OrderService.cancelOrder(orderId);
                    message.success('Order cancelled successfully');
                    fetchOrders(); // Refresh list
                } catch (err) {
                    message.error('Failed to cancel order');
                } finally {
                    setCancellingId(null);
                }
            },
        });
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text strong>#{text}</Text>,
        },
        {
            title: 'Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (text) => new Date(text).toLocaleDateString(),
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => `₹${amount}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'geekblue';
                if (status === 'COMPLETED' || status === 'DELIVERED') color = 'green';
                if (status === 'CANCELLED') color = 'volcano';
                return (
                    <Tag color={color} key={status}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Items',
            key: 'items',
            render: (_, record) => (
                <Text>{record.items.length} items</Text>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                record.status === 'PENDING' && (
                    <Button
                        type="primary"
                        danger
                        size="small"
                        loading={cancellingId === record.id}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent row expansion
                            handleCancelOrder(record.id);
                        }}
                    >
                        Cancel
                    </Button>
                )
            ),
        }
    ];

    return (
        <Layout className="layout">
            <Content style={{ padding: '0 50px', marginTop: 64 }}>
                <div className="site-layout-content">
                    <Title level={2}><ShoppingOutlined /> Order History</Title>
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        loading={loading}
                        expandable={{
                            expandIcon: ({ expanded, onExpand, record }) => (
                                expanded ? (
                                    <UpOutlined onClick={e => onExpand(record, e)} />
                                ) : (
                                    <DownOutlined onClick={e => onExpand(record, e)} />
                                )
                            ),
                            expandedRowRender: (record) => (
                                <Table
                                    columns={[
                                        { title: 'Product', dataIndex: 'productName', key: 'productName' },
                                        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                                        { title: 'Price', dataIndex: 'price', key: 'price', render: (text) => `₹${text}` },
                                        { title: 'Total', dataIndex: 'total', key: 'total', render: (text) => `₹${text}` },
                                    ]}
                                    dataSource={record.items}
                                    pagination={false}
                                    rowKey="id"
                                />
                            )
                        }}
                    />
                    {orders.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            <Button type="primary" onClick={() => navigate('/')}>
                                Start Shopping
                            </Button>
                        </div>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default OrderHistoryPage;
