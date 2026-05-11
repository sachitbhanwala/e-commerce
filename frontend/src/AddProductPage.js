import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Checkbox, Col, Form, Input, InputNumber, Result, Row, Select, Space, Spin, Typography } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { buildProductPayload } from './models/productModel';
import { createProduct, getProductById, updateProduct } from './services/ProductService';


const { Title, Text } = Typography;

const initialFormState = {
  name: '',
  price: '',
  image: '',
  imageUrls: '',
  category: '',
  shortDescription: '',
  fullDescription: '',
  recommendedOnly: false
};

const baseCategoryOptions = [
  'General',
  'Accessories',
  'Audio',
  'Bags',
  'Gaming',
  'Laptop',
  'Mobile',
  'Peripherals',
  'Smart Home',
  'Storage',
  'Wearables'
];

const AddProductPage = ({ currentUser }) => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingProduct, setLoadingProduct] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const categoryOptions = useMemo(() => {
    const customCategories = formData.category
      && !baseCategoryOptions.includes(formData.category)
      ? [formData.category]
      : [];
    const sortedCategories = [...baseCategoryOptions, ...customCategories]
      .filter((category) => category && category !== 'General')
      .sort((a, b) => a.localeCompare(b));
    return ['General', ...sortedCategories];
  }, [formData.category]);
  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }

    if (!currentUser) {
      return undefined;
    }

    let isActive = true;
    const loadProduct = async () => {
      try {
        setLoadingProduct(true);
        const data = await getProductById(id);
        if (!isActive) {
          return;
        }

        const nextForm = {
          name: data.name || '',
          price: data.price ? Number(data.price) : '',
          image: data.image || '',
          imageUrls: data.imageUrls ? data.imageUrls.join(', ') : '',
          category: data.category || '',
          shortDescription: data.shortDescription || '',
          fullDescription: data.fullDescription || '',
          recommendedOnly: Boolean(data.recommendedOnly)
        };

        setFormData(nextForm);
        form.setFieldsValue(nextForm);
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'Unable to load product.');
        }
      } finally {
        if (isActive) {
          setLoadingProduct(false);
        }
      }
    };

    loadProduct();
    return () => {
      isActive = false;
    };
  }, [id, isEdit, form, currentUser]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setError('Please login to perform this action.');
      return;
    }

    if (!formData.name || !formData.price || !formData.image || !formData.shortDescription || !formData.fullDescription) {
      setError('Please fill in name, price, image URL, short description, and full description.');
      return;
    }

    if (Number(formData.price) < 1) {
      setError('Price must be at least 1.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = buildProductPayload(formData);
      if (isEdit) {
        await updateProduct(id, payload);
        navigate('/', {
          state: {
            success: 'Product updated successfully.'
          }
        });
      } else {
        await createProduct(payload);
        setFormData(initialFormState);
        form.resetFields();
        navigate('/', {
          state: {
            success: 'Product added successfully.'
          }
        });
      }
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Result
        status="403"
        title="Login required"
        subTitle="Please login to add or edit products."
        extra={(
          <Button type="primary" onClick={() => navigate('/auth')}>
            Login
          </Button>
        )}
      />
    );
  }

  return (
    <div className="form-page">
      <Card className="form-card" variant="borderless">
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Space align="center">
            <Button
              icon={<LeftOutlined />}
              type="text"
              aria-label="Back"
              onClick={() => navigate(-1)}
            />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {isEdit ? 'Edit Product' : 'Add a New Product'}
              </Title>
              <Text type="secondary">
                {isEdit
                  ? 'Update the product details and save your changes.'
                  : 'Create a new product and publish it to the store.'}
              </Text>
            </div>
          </Space>

          {error && <Alert type="error" title={error} showIcon />}

          <Spin spinning={loadingProduct} description="Loading product...">
            <Form
              form={form}
              layout="vertical"
              initialValues={formData}
              onFinish={handleSubmit}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Product Name" required>
                    <Input
                      value={formData.name}
                      onChange={(event) => handleChange('name', event.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Price (INR)" required>
                    <InputNumber
                      min={1}
                      step={0.01}
                      style={{ width: '100%' }}
                      value={formData.price === '' ? null : formData.price}
                      onChange={(value) => handleChange('price', value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Image URL" required>
                    <Input
                      value={formData.image}
                      onChange={(event) => handleChange('image', event.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Secondary Image URLs (Comma Separated)" name="imageUrls">
                    <Input
                      value={formData.imageUrls}
                      onChange={(event) => handleChange('imageUrls', event.target.value)}
                      placeholder="https://image1.com, https://image2.com"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Category">
                    <Select
                      value={formData.category}
                      onChange={(value) => handleChange('category', value)}
                      placeholder="Select category"
                    >
                      {categoryOptions.map((category) => (
                        <Select.Option key={category} value={category}>
                          {category}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Short Description" required>
                    <Input
                      value={formData.shortDescription}
                      onChange={(event) => handleChange('shortDescription', event.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item label="Full Description" required>
                    <Input.TextArea
                      rows={5}
                      value={formData.fullDescription}
                      onChange={(event) => handleChange('fullDescription', event.target.value)}
                      placeholder="Describe the product features and benefits"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="form-footer">
                <Checkbox
                  checked={formData.recommendedOnly}
                  onChange={(event) => handleChange('recommendedOnly', event.target.checked)}
                >
                  Recommendation only (hide from main page)
                </Checkbox>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {submitting ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Product')}
                </Button>
              </div>
            </Form>
          </Spin>
        </Space>
      </Card>
    </div>
  );
};

export default AddProductPage;
