import { useState } from 'react'
import {
  Table, Button, Tag, Input, Select, Space, Modal, Form,
  InputNumber, Typography, App, Popconfirm,
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title } = Typography
const { Option } = Select

const trangThaiConfig = {
  TRONG:    { color: 'green',  label: 'Còn trống' },
  DA_THUE:  { color: 'blue',   label: 'Đã thuê'   },
  DANG_SUA: { color: 'orange', label: 'Đang sửa'  },
}

export default function RoomsPage() {
  const [search, setSearch] = useState('')
  const [trangThai, setTrangThai] = useState(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', search, trangThai],
    queryFn: () => roomApi.getAll({ search, trangThai }).then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['rooms'] })

  const createMutation = useMutation({
    mutationFn: roomApi.create,
    onSuccess: () => { message.success('Thêm phòng thành công'); closeModal(); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi thêm phòng'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.update(id, data),
    onSuccess: () => { message.success('Cập nhật thành công'); closeModal(); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi cập nhật'),
  })

  const deleteMutation = useMutation({
    mutationFn: roomApi.delete,
    onSuccess: () => { message.success('Xóa phòng thành công'); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Không thể xóa phòng này'),
  })

  const openCreate = () => { setEditingRoom(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (room) => {
    setEditingRoom(room)
    form.setFieldsValue(room)
    setModalOpen(true)
  }
  const closeModal = () => { setModalOpen(false); setEditingRoom(null); form.resetFields() }

  const onFinish = (values) => {
    if (editingRoom) updateMutation.mutate({ id: editingRoom.id, data: values })
    else createMutation.mutate(values)
  }

  const columns = [
    { 
      title: 'Tên phòng', 
      dataIndex: 'tenPhong', 
      key: 'tenPhong', 
      sorter: (a, b) => a.tenPhong.localeCompare(b.tenPhong),
      ...getColumnSearchProps('tenPhong', 'tên phòng')
    },
    { title: 'Diện tích (m²)', dataIndex: 'dienTich', key: 'dienTich', sorter: (a, b) => a.dienTich - b.dienTich },
    { title: 'Số người tối đa', dataIndex: 'soNguoiToiDa', key: 'soNguoiToiDa', render: (v) => v || 'Không giới hạn' },
    {
      title: 'Giá thuê',
      dataIndex: 'giaThue',
      key: 'giaThue',
      render: (v) => `${Number(v).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (v) => <Tag color={trangThaiConfig[v]?.color}>{trangThaiConfig[v]?.label}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa phòng này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý phòng trọ</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm phòng</Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Tìm theo tên phòng..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240 }}
          allowClear
        />
        <Select
          placeholder="Lọc trạng thái"
          value={trangThai}
          onChange={setTrangThai}
          style={{ width: 160 }}
          allowClear
        >
          <Option value="TRONG">Còn trống</Option>
          <Option value="DA_THUE">Đã thuê</Option>
          <Option value="DANG_SUA">Đang sửa</Option>
        </Select>
      </Space>

      <Table
        rowKey="id"
        dataSource={data ?? []}
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} phòng` }}
      />

      <Modal
        title={editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Form.Item label="Tên phòng" name="tenPhong" rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}>
            <Input placeholder="VD: Phòng 101" />
          </Form.Item>
          <Form.Item label="Giá thuê (đ/tháng)" name="giaThue" rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={100000} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="Diện tích (m²)" name="dienTich">
            <InputNumber style={{ width: '100%' }} min={0} step={0.5} />
          </Form.Item>
          <Form.Item label="Số người tối đa" name="soNguoiToiDa">
            <InputNumber style={{ width: '100%' }} placeholder="Không giới hạn" />
          </Form.Item>
          <Form.Item label="Tiện nghi" name="tienNghi">
            <Input.TextArea rows={3} placeholder="Điều hòa, nóng lạnh, tủ lạnh..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={closeModal}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingRoom ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
