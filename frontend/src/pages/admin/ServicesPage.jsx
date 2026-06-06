import { useState } from 'react'
import { Table, Button, Typography, Space, Modal, Form, Input, InputNumber, App, Popconfirm, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title } = Typography

export default function ServicesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.getAll().then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['services'] })

  const createMutation = useMutation({
    mutationFn: serviceApi.create,
    onSuccess: () => { message.success('Đã thêm dịch vụ'); closeModal(); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => serviceApi.update(id, data),
    onSuccess: () => { message.success('Đã cập nhật'); closeModal(); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi'),
  })

  const deleteMutation = useMutation({
    mutationFn: serviceApi.delete,
    onSuccess: () => { message.success('Đã xóa dịch vụ'); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi'),
  })

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null); form.resetFields() }
  const onFinish = (v) => editing ? updateMutation.mutate({ id: editing.id, data: v }) : createMutation.mutate(v)

  const columns = [
    { title: 'Tên dịch vụ', dataIndex: 'tenDichVu', key: 'tenDichVu', ...getColumnSearchProps('tenDichVu', 'tên dịch vụ') },
    { title: 'Đơn giá', dataIndex: 'donGiaMacDinh', key: 'donGiaMacDinh', render: v => `${Number(v).toLocaleString('vi-VN')} đ` },
    { title: 'Đơn vị', dataIndex: 'donVi', key: 'donVi' },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa' },
    {
      title: 'Thao tác', key: 'action',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>Sửa</Button>
          <Popconfirm title="Xóa dịch vụ này?" onConfirm={() => deleteMutation.mutate(r.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý dịch vụ</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm dịch vụ</Button>
      </div>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />

      <Modal title={editing ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'} open={modalOpen} onCancel={closeModal} footer={null} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Form.Item label="Tên dịch vụ" name="tenDichVu" rules={[{ required: true }]}><Input placeholder="VD: Internet, Gửi xe, Rác..." /></Form.Item>
          <Form.Item label="Đơn giá" name="donGiaMacDinh" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={10000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="Đơn vị" name="donVi" rules={[{ required: true }]}>
            <Select placeholder="Chọn đơn vị">
              <Select.Option value="đ/phòng">đ/phòng (Cộng thẳng vào hóa đơn)</Select.Option>
              <Select.Option value="đ/người">đ/người (Nhân với số người ở)</Select.Option>
              <Select.Option value="đ/tháng">đ/tháng</Select.Option>
              <Select.Option value="đ/lần">đ/lần</Select.Option>
            </Select>
          </Form.Item>
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
