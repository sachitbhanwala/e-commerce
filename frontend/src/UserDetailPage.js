import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Result, Select, Space, Spin, Table, Typography } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { getUserById, updateUser } from './services/UserService';

const { Title, Text } = Typography;

const UserDetailPage = ({ currentUser }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [form] = Form.useForm();

  const openEditOnLoad = useMemo(() => Boolean(location.state && location.state.edit), [location.state]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserById(id);
        setUser(data);
        setError('');
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [currentUser, id]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        role: user.role
      });
      if (openEditOnLoad) {
        setEditing(true);
      }
    }
  }, [form, openEditOnLoad, user]);

  const handleSave = async (values) => {
    if (!user) {
      return;
    }

    try {
      setSaving(true);
      setSaveError('');
      const updated = await updateUser(user.id, values);
      setUser(updated);
      setSuccessMessage('User updated successfully.');
      setEditing(false);
    } catch (saveError) {
      setSaveError(saveError.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="centered">
        <Spin description="Loading user..." size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Result
        status="403"
        title="Login required"
        subTitle="Please login with an admin account to view user details."
        extra={(
          <Button type="primary" onClick={() => navigate('/auth')}>
            Login
          </Button>
        )}
      />
    );
  }

  if (currentUser.role !== 'ADMIN') {
    return (
      <Result
        status="403"
        title="Access denied"
        subTitle="You do not have permission to view this page."
        extra={(
          <Button type="primary" onClick={() => navigate('/')}
          >
            Back to products
          </Button>
        )}
      />
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Unable to load user"
        subTitle={error}
        extra={(
          <Button type="primary" onClick={() => navigate('/users')}
          >
            Back to users
          </Button>
        )}
      />
    );
  }

  if (!user) {
    return <Result status="404" title="User not found" />;
  }

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id'
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
      key: 'status'
    },
    {
      title: 'Placed',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-')
    }
  ];

  return (
    <div className="page-shell">
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Space wrap>
          <Button onClick={() => navigate('/users')}>Back to users</Button>
          <Button type="primary" onClick={() => setEditing((prev) => !prev)}>
            {editing ? 'Cancel edit' : 'Edit user'}
          </Button>
        </Space>
        {successMessage && <Alert type="success" title={successMessage} showIcon />}
        {saveError && <Alert type="error" title={saveError} showIcon />}
        <Card variant="borderless" className="page-card">
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Space orientation="vertical" size={4}>
              <Title level={3} style={{ margin: 0 }}>{user.name}</Title>
              <Text type="secondary">{user.email}</Text>
            </Space>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
              <Descriptions.Item label="Joined">
                {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">{user.phone || 'Not provided'}</Descriptions.Item>
              <Descriptions.Item label="Address">{user.address || 'Not provided'}</Descriptions.Item>
            </Descriptions>
          </Space>
        </Card>

        {editing && (
          <Card variant="borderless" className="page-card">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>Edit details</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
              >
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: 'Name is required.' }]}
                >
                  <Input placeholder="Full name" />
                </Form.Item>
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: 'Role is required.' }]}
                >
                  <Select
                    options={[
                      { label: 'User', value: 'USER' },
                      { label: 'Admin', value: 'ADMIN' }
                    ]}
                  />
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

        <Card variant="borderless" className="page-card">
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0 }}>Order history</Title>
            {user.orders && user.orders.length > 0 ? (
              <Table
                rowKey="id"
                columns={orderColumns}
                dataSource={user.orders}
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Empty description="No orders yet" />
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default UserDetailPage;
