import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Rate,
  Space,
  Typography,
  Empty,
  Divider,
  message
} from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { addReview, deleteReview, updateReview } from '../services/ReviewService';
import './ReviewList.css';

const { Text, Paragraph } = Typography;

const ReviewList = ({ reviews, averageRating, productId, currentUser, onReviewAdded }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm] = Form.useForm();
  const [messageApi, messageContext] = message.useMessage();

  const handleSubmit = async (values) => {
    try {
      console.log('Submitting review:', values);
      setSubmitting(true);
      await addReview(productId, values);
      messageApi.success('Review added');
      form.resetFields();
      onReviewAdded?.();
    } catch (err) {
      console.error('Review submission error:', err);
      messageApi.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      setSubmitting(true);
      await updateReview(editingId, values);
      messageApi.success('Review updated');
      setEditingId(null);
      editForm.resetFields();
      onReviewAdded?.();
    } catch (err) {
      messageApi.error(err.message || 'Failed to update review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      messageApi.success('Review deleted');
      onReviewAdded?.();
    } catch (err) {
      messageApi.error(err.message || 'Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    setEditingId(review.id);
    editForm.setFieldsValue({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    editForm.resetFields();
  };

  return (
    <div className="review-list-container">
      {messageContext}

      <div className="review-header">
        <Space orientation="vertical" size={0}>
          <Space size="small" align="center">
            <Text strong style={{ fontSize: 18 }}>
              {averageRating?.toFixed(1) || 'No'}
            </Text>
            <Rate
              value={Math.round(averageRating) || 0}
              disabled
              style={{ fontSize: 16 }}
            />
            <Text type="secondary">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </Text>
          </Space>
        </Space>
      </div>

      <Divider />

      {currentUser && currentUser.role !== 'ADMIN' && (
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="review-form"
          >
            <Form.Item
              label="Your Rating"
              name="rating"
              rules={[{ required: true, message: 'Please select a rating.' }]}
            >
              <Rate />
            </Form.Item>
            <Form.Item label="Your Comment (optional)" name="comment">
              <Input.TextArea rows={3} placeholder="Share your experience..." />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Add Review
            </Button>
          </Form>

          {editingId && (
            <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
              <Text strong>Editing Review</Text>
              <Form
                form={editForm}
                layout="vertical"
                onFinish={handleEditSubmit}
                style={{ marginTop: 16 }}
              >
                <Form.Item label="Rating" name="rating">
                  <Rate />
                </Form.Item>
                <Form.Item label="Comment" name="comment">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    Update Review
                  </Button>
                  <Button onClick={handleCancelEdit} disabled={submitting}>
                    Cancel
                  </Button>
                </Space>
              </Form>
            </div>
          )}

          <Divider />
        </>
      )}

      {!currentUser && (
        <>
          <Text type="secondary">Login to add a review</Text>
          <Divider />
        </>
      )}

      <div className="reviews-section">
        {reviews.length === 0 ? (
          <Empty description="No reviews yet" />
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <Space orientation="vertical" size={4} style={{ width: '100%' }}>
                <Space orientation="horizontal" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size="small">
                    <Text strong>{review.userName}</Text>
                    <Rate value={review.rating} disabled style={{ fontSize: 14 }} />
                  </Space>
                  {currentUser?.name === review.userName && (
                    <Space size="small">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(review)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(review.id)}
                      >
                        Delete
                      </Button>
                    </Space>
                  )}
                </Space>
                {review.comment && (
                  <Paragraph className="review-comment">{review.comment}</Paragraph>
                )}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </Space>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;
