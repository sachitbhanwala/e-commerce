import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Image, Tag, Input } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from './services/ProductService';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            message.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            message.success('Product deleted successfully');
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            message.error(error.message || 'Failed to delete product. It may be part of an existing order.');
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (url) => <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} fallback="https://via.placeholder.com/50" />
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (cat) => <Tag color="blue">{cat}</Tag>,
            filters: Array.from(new Set(products.map(p => p.category))).map(cat => ({ text: cat, value: cat })),
            onFilter: (value, record) => record.category === value,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (val) => `₹${val.toLocaleString()}`,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/edit/${record.id}`)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete the product"
                        description="Are you sure you want to delete this product? This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes, delete"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.category.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', minHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <h2>Manage Products</h2>
                <Space>
                    <Input
                        placeholder="Search products..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add')}>
                        Add New Product
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredProducts}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 15 }}
            />
        </div>
    );
};

export default ManageProducts;
