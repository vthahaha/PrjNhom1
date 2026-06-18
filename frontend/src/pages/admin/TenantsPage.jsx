// TenantsPage.jsx
import { Table, Button, Tag, Typography, App, Popconfirm, Space, Modal, Form, Input, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import dayjs from 'dayjs'
import { tenantApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title, Text } = Typography

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
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen', ...getColumnSearchProps('hoTen', 'họ tên') },
    { title: 'Số điện thoại', dataIndex: 'soDienThoai', key: 'soDienThoai', ...getColumnSearchProps('soDienThoai', 'số điện thoại') },
    { title: 'CCCD', dataIndex: 'cccd', key: 'cccd' },
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong', render: v => v ? <Tag color="purple">{v}</Tag> : <Text type="secondary">Chưa thuê</Text> },
    {
      title: 'Trạng thái',
      dataIndex: 'coHopDongHieuLuc',
      key: 'coHopDongHieuLuc',
      render: (coHopDong) => (
        <Tag color={coHopDong ? 'green' : 'default'}>
          {coHopDong ? 'Đang thuê' : 'Không thuê'}
        </Tag>
      )
    },
    { title: 'Ngày ký HĐ', dataIndex: 'ngayBatDauHopDong', key: 'ngayBatDauHopDong', render: v => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
    { title: 'Vai trò', dataIndex: 'vaiTro', key: 'vaiTro', render: v => v === 'ADMIN' ? <Tag color="gold">ADMIN</Tag> : <Tag color="blue">TENANT</Tag> },
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
          <Form.Item label="Họ tên" name="hoTen" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}><Input /></Form.Item>
          <Form.Item label="Số điện thoại" name="soDienThoai" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ' }]}><Input /></Form.Item>
          <Form.Item label="Email" name="email"><Input /></Form.Item>
          <Form.Item label="CCCD" name="cccd" rules={[{ required: true, message: 'Vui lòng nhập số CCCD' }, { pattern: /^\d{9,12}$/, message: 'CCCD không hợp lệ (phải gồm 9-12 chữ số)' }]}><Input /></Form.Item>
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
