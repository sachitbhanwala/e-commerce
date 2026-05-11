import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Result, Space, Spin, Table, Tag, Typography, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { getMyProfile, updateMyProfile } from './services/UserService';
import OrderService from './services/OrderService';
import AddressService from './services/AddressService';

const { Title, Text } = Typography;

const ProfilePage = ({ currentUser, setCurrentUser }) => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getMyProfile(controller.signal);

        if (controller.signal.aborted) return;

        setProfile(data);
        setError('');

        // Fetch orders when profile loads
        try {
          setOrdersLoading(true);
          const orderData = await OrderService.getUserOrders();
          setOrders(orderData);
        } catch (orderErr) {
          console.error("Failed to load orders", orderErr);
        } finally {
          setOrdersLoading(false);
        }

        // Fetch saved addresses
        try {
          setAddressesLoading(true);
          const addressData = await AddressService.getUserAddresses();
          setSavedAddresses(addressData);
        } catch (addrErr) {
          console.error("Failed to load addresses", addrErr);
        } finally {
          setAddressesLoading(false);
        }

      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError.message || 'Failed to load profile.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      controller.abort();
    };
  }, [currentUser]);

  useEffect(() => {
    if (editing && profile) {
      form.setFieldsValue({
        name: profile.name,
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [editing, profile, form]);

  const handleSave = async (values) => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      const updated = await updateMyProfile(values);
      let nextProfile = updated;

      try {
        const refreshed = await getMyProfile();
        nextProfile = refreshed || updated;
      } catch {
        nextProfile = updated;
      }

      setProfile(nextProfile);
      form.setFieldsValue({
        name: nextProfile.name,
        phone: nextProfile.phone || '',
        address: nextProfile.address || ''
      });
      setSuccessMessage('Profile updated successfully.');
      setEditing(false);
    } catch (saveError) {
      setError(saveError.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (values) => {
    try {
      setSavingAddress(true);
      setError('');
      setSuccessMessage('');
      const newAddr = await AddressService.addAddress(values);
      setSavedAddresses([...savedAddresses, newAddr]);
      setShowNewAddressForm(false);
      addressForm.resetFields();
      setSuccessMessage('Address added successfully.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to add address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await AddressService.deleteAddress(addressId);
      setSavedAddresses(savedAddresses.filter(a => a.id !== addressId));
      message.success('Address deleted successfully.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await AddressService.setDefaultAddress(addressId);
      setSavedAddresses(savedAddresses.map(a =>
        a.id === addressId ? { ...a, default: true } : { ...a, default: false }
      ));
      setSuccessMessage('Default address updated successfully.');
    } catch (error) {
      setError(error.message || 'Failed to set default address.');
    }
  };

  if (loading) {
    return (
      <div className="centered">
        <Spin description="Loading profile..." size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Result
        status="403"
        title="Login required"
        subTitle="Please login to view your profile."
        extra={(
          <Button type="primary" onClick={() => navigate('/auth')}>
            Login
          </Button>
        )}
      />
    );
  }

  if (!profile) {
    return <Result status="404" title="Profile not found" />;
  }

  return (
    <div className="page-shell">
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Button onClick={() => navigate('/')}>Back to products</Button>
        {successMessage && <Alert type="success" title={successMessage} showIcon />}
        {error && <Alert type="error" title={error} showIcon />}
        <Card variant="borderless" className="page-card">
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Space orientation="vertical" size={4}>
              <Title level={3} style={{ margin: 0 }}>{profile.name}</Title>
              <Text type="secondary">{profile.email}</Text>
            </Space>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Phone">{profile.phone || 'Not provided'}</Descriptions.Item>
              <Descriptions.Item label="Address">{profile.address || 'Not provided'}</Descriptions.Item>
            </Descriptions>
            <Space>
              <Button type="primary" onClick={() => setEditing((prev) => !prev)}>
                {editing ? 'Cancel edit' : 'Edit details'}
              </Button>
            </Space>
          </Space>
        </Card>

        {editing && (
          <Card variant="borderless" className="page-card">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>Edit profile</Title>
              <Form form={form} layout="vertical" onFinish={handleSave}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: 'Name is required.' }]}
                >
                  <Input placeholder="Full name" />
                </Form.Item>
                <Form.Item
                  label="Phone"
                  name="phone"
                >
                  <Input placeholder="Phone number" />
                </Form.Item>
                <Form.Item
                  label="Address"
                  name="address"
                >
                  <Input.TextArea rows={3} placeholder="Your address" />
                </Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Save changes
                  </Button>
                  <Button onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </Button>
                </Space>
              </Form>
            </Space>
          </Card>
        )}

        <Card bordered={false} className="page-card">
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0 }}>Saved Addresses</Title>
              <Button onClick={() => setShowNewAddressForm(true)} disabled={showNewAddressForm}>
                + Add New Address
              </Button>
            </div>
            {addressesLoading ? (
              <Spin />
            ) : savedAddresses && savedAddresses.length > 0 ? (
              <Space size={16} wrap>
                {savedAddresses.map(addr => (
                  <Card
                    size="small"
                    key={addr.id}
                    style={{ width: 300, position: 'relative' }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteAddress(addr.id)}
                        style={{ position: 'absolute', top: 5, right: 5 }}
                      />
                    }
                  >
                    <div style={{ paddingRight: 24 }}>
                      <Text strong>{addr.fullName}</Text> {addr.default && <Tag color="blue">Default</Tag>} <br />
                      <Text>{addr.address}</Text><br />
                      <Text>{addr.city}, {addr.zip}</Text>
                      {!addr.default && (
                        <div style={{ marginTop: 8 }}>
                          <Button size="small" type="link" style={{ padding: 0 }} onClick={() => handleSetDefaultAddress(addr.id)}>
                            Set as Default
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No saved addresses.</Text>
            )}

            {showNewAddressForm && (
              <Card title="Add New Address" size="small" style={{ marginTop: 16 }}>
                <Form
                  form={addressForm}
                  layout="vertical"
                  onFinish={handleAddAddress}
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
                    <Button type="primary" htmlType="submit" loading={savingAddress}>
                      Save Address
                    </Button>
                    <Button onClick={() => setShowNewAddressForm(false)} disabled={savingAddress}>
                      Cancel
                    </Button>
                  </Space>
                </Form>
              </Card>
            )}
          </Space>
        </Card>

        {currentUser?.role !== 'ADMIN' && (
          <Card bordered={false} className="page-card">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>Order history</Title>
              {ordersLoading ? (
                <Spin />
              ) : orders && orders.length > 0 ? (
                <Table
                  rowKey="id"
                  columns={[
                    {
                      title: 'Order ID',
                      dataIndex: 'id',
                      key: 'id',
                      render: (text) => <Text strong>#{text}</Text>
                    },
                    {
                      title: 'Date',
                      dataIndex: 'orderDate',
                      key: 'orderDate',
                      render: (value) => (value ? new Date(value).toLocaleDateString() : '-')
                    },
                    {
                      title: 'Total',
                      dataIndex: 'totalAmount',
                      key: 'totalAmount',
                      render: (value) => (value ? `₹${Number(value).toFixed(2)}` : '-')
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={status === 'COMPLETED' ? 'green' : status === 'CANCELLED' ? 'red' : 'blue'}>
                          {status}
                        </Tag>
                      )
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      render: (_, record) => (
                        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
                          View Details
                        </Button>
                      ),
                    }
                  ]}
                  dataSource={orders}
                  pagination={{ pageSize: 5 }}
                />
              ) : (
                <Empty description="No orders yet" />
              )}
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default ProfilePage;
