import React from 'react';
import { Modal } from 'antd';

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) => (
  <Modal
    open={open}
    title={title}
    onOk={onConfirm}
    onCancel={onCancel}
    okText={confirmLabel}
    cancelText={cancelLabel}
    okButtonProps={{ danger: true }}
  >
    <p>{message}</p>
  </Modal>
);

export default ConfirmDialog;
