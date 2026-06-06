// TenantsPage.jsx
import { Table, Button, Tag, Typography, App, Popconfirm, Space, Modal, Form, Input, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { tenantApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title } = Typography

export default function TenantsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantApi.getAll().then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['tenants'] })

  const createMutation = useMutation({
    mutationFn: tenantApi.create,
    onSuccess: () => { message.success('Thêm khách thuê thành công'); closeModal(); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi thêm'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tenantApi.update(id, data),
    onSuccess: () => { message.success('Cập nhật thành công'); closeModal(); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi cập nhật'),
  })

  const deleteMutation = useMutation({
    mutationFn: tenantApi.delete,
    onSuccess: () => { message.success('Đã xóa'); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Không thể xóa'),
  })

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields() }
  const onFinish = (v) => editing ? updateMutation.mutate({ id: editing.id, data: v }) : createMutation.mutate(v)

  const columns = [
    { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen', ...getColumnSearchProps('hoTen', 'họ tên') },
    { title: 'Số điện thoại', dataIndex: 'soDienThoai', key: 'soDienThoai', ...getColumnSearchProps('soDienThoai', 'số điện thoại') },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'CCCD', dataIndex: 'cccd', key: 'cccd' },
    {
      title: 'Thao tác', key: 'action',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Sửa</Button>
          <Popconfirm title="Xóa khách thuê này?" onConfirm={() => deleteMutation.mutate(r.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý khách thuê</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm khách</Button>
      </div>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />

      <Modal title={editing ? 'Chỉnh sửa khách thuê' : 'Thêm khách thuê mới'} open={modalOpen} onCancel={closeModal} footer={null} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Form.Item label="Họ tên" name="hoTen" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Số điện thoại" name="soDienThoai" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Email" name="email"><Input /></Form.Item>
          <Form.Item label="CCCD" name="cccd"><Input /></Form.Item>
          <Form.Item label="Quê quán" name="queQuan"><Input /></Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={closeModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
