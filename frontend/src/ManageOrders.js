import React, { useState, useEffect } from 'react';
import { Button, Space, Table, Spin, Alert, Select, message } from 'antd';
import { getAuthHeader } from './services/AuthService';

const { Option } = Select;
const API_BASE_URL = 'http://localhost:8080/api';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            // Need a new endpoint to fetch ALL orders. Reusing an existing order endpoint pattern for now,
            // assuming we will create `/api/admin/orders` next.
            const response = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: getAuthHeader()
            });
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            const sorted = Array.isArray(data)
                ? [...data].sort((a, b) => {
                    const dateA = a?.orderDate ? Date.parse(a.orderDate) : 0;
                    const dateB = b?.orderDate ? Date.parse(b.orderDate) : 0;
                    if (dateA !== dateB) return dateB - dateA;
                    const idA = Number(a?.id || 0);
                    const idB = Number(b?.id || 0);
                    return idB - idA;
                })
                : [];
            setOrders(sorted);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            message.success('Order status updated');
            fetchOrders(); // Refresh to get latest data
        } catch (err) {
            message.error(err.message);
        }
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'User',
            key: 'user',
            render: (text, record) => record.user?.email || 'Unknown',
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
            render: (amount) => `₹${parseFloat(amount).toFixed(2)}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 120 }}
                    onChange={(value) => handleStatusChange(record.id, value)}
                >
                    <Option value="PENDING">Pending</Option>
                    <Option value="PROCESSING">Processing</Option>
                    <Option value="SHIPPED">Shipped</Option>
                    <Option value="DELIVERED">Delivered</Option>
                    <Option value="CANCELLED">Cancelled</Option>
                </Select>
            ),
        }
    ];

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;
    if (error) return <Alert message="Error" description={error} type="error" showIcon />;

    return (
        <div>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Manage Orders</h2>
                <Button onClick={fetchOrders} loading={loading}>Refresh</Button>
            </Space>
            <Table
                dataSource={orders}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10, showSizeChanger: true }}
            />
        </div>
    );
};

export default ManageOrders;
