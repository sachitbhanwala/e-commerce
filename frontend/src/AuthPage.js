import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Spin, Tabs, Typography } from 'antd';
import { login, signup } from './services/AuthService';

const { Title, Text } = Typography;

const AuthPage = () => {
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const handleFinish = async (values) => {
    setError('');
    try {
      let userData;
      if (activeTab === 'login') {
        userData = await login(values);
      } else {
        userData = await signup(values);
      }
      navigate('/', {
        state: {
          success: activeTab === 'login' ? 'Logged in successfully.' : 'Account created successfully.',
          user: userData
        }
      });
    } catch (err) {
      setError(err.message || 'Request failed');
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="centered">
          <Spin size="large" description="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Card className="auth-card" variant="borderless">
        <Title level={3} style={{ marginBottom: 4 }}>Welcome</Title>
        <Text type="secondary">Sign in or create an account to continue.</Text>

        {error && <Alert type="error" title={error} showIcon style={{ marginTop: 16 }} />}

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setError('');
          }}
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'login',
              label: 'Login',
              children: (
                <Form layout="vertical" onFinish={handleFinish}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please enter your email.' }]}
                  >
                    <Input placeholder="you@example.com" />
                  </Form.Item>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password.' }]}
                  >
                    <Input.Password placeholder="Enter your password" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Login
                  </Button>
                </Form>
              )
            },
            {
              key: 'signup',
              label: 'Signup',
              children: (
                <Form layout="vertical" onFinish={handleFinish}>
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name.' }]}
                  >
                    <Input placeholder="Your full name" />
                  </Form.Item>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please enter your email.' }]}
                  >
                    <Input placeholder="you@example.com" />
                  </Form.Item>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter a password.' }]}
                  >
                    <Input.Password placeholder="Create a password" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block>
                    Create Account
                  </Button>
                </Form>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default AuthPage;
