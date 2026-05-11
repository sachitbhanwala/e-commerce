import React, { useEffect } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { UserOutlined, ShoppingCartOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AdminLayout = ({ currentUser, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') {
            navigate('/');
        }
    }, [currentUser, navigate]);

    if (!currentUser || currentUser.role !== 'ADMIN') return null;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible theme="dark">
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    Admin Panel
                </div>
                <Menu theme="dark" defaultSelectedKeys={[location.pathname]} mode="inline">
                    <Menu.Item key="/admin" icon={<AppstoreOutlined />}>
                        <Link to="/admin">Dashboard</Link>
                    </Menu.Item>
                    <Menu.Item key="/admin/users" icon={<UserOutlined />}>
                        <Link to="/admin/users">Manage Users</Link>
                    </Menu.Item>
                    <Menu.Item key="/admin/orders" icon={<ShoppingCartOutlined />}>
                        <Link to="/admin/orders">Manage Orders</Link>
                    </Menu.Item>
                    <Menu.Item key="/admin/products" icon={<AppstoreOutlined />}>
                        <Link to="/admin/products">Manage Products</Link>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: '0 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>E-Commerce Administration</Title>
                    <div>
                        <span style={{ marginRight: 16 }}>Welcome, {currentUser.name}</span>
                    </div>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <div className="site-layout-background" style={{ padding: 24, minHeight: 360, marginTop: 16 }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
