import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Result, Space, Spin, Table, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { getUsers } from './services/UserService';

const { Title, Text } = Typography;

const UsersPage = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setError('');
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="centered">
        <Spin description="Loading users..." size="large" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Result
        status="403"
        title="Login required"
        subTitle="Please login with an admin account to view users."
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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/users/${record.id}`)}
        >
          <Text strong>{value}</Text>
        </Button>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role'
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => (value ? new Date(value).toLocaleDateString() : '-')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button onClick={() => navigate(`/users/${record.id}`, { state: { edit: true } })}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <div className="page-shell">
      <Card variant="borderless" className="page-card">
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <Space orientation="vertical" size={4}>
            <Title level={3} style={{ margin: 0 }}>Users</Title>
            <Text type="secondary">Click a user to view details.</Text>
          </Space>
          {error && <Alert type="error" title={error} showIcon />}
          <Table
            rowKey="id"
            columns={columns}
            dataSource={users}
            pagination={{ pageSize: 8 }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default UsersPage;
