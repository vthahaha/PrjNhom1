import { useState } from 'react'
import {
  Table, Button, Tag, Input, Select, Space, Modal, Form,
  InputNumber, Typography, App, Popconfirm, Checkbox, Row, Col
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomApi, serviceApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title } = Typography
const { Option } = Select

const trangThaiConfig = {
  TRONG:    { color: 'green',  label: 'Còn trống' },
  DA_THUE:  { color: 'blue',   label: 'Đã thuê'   },
  DANG_SUA: { color: 'orange', label: 'Đang sửa'  },
}

const COMMON_FACILITIES = [
  'Điều hòa', 'Máy giặt', 'Tủ lạnh', 'Bếp', 'Giường', 
  'Tủ quần áo', 'Nóng lạnh', 'Internet'
]

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

  const { data: allServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceApi.getAll().then(r => r.data)
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['rooms'] })

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const roomRes = await roomApi.create(data.roomData)
      const roomId = roomRes.data.id
      if (data.servicesData && data.servicesData.items.length > 0) {
        await roomApi.updateServices(roomId, data.servicesData)
      }
      return roomRes.data
    },
    onSuccess: () => { message.success('Thêm phòng thành công'); closeModal(); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi thêm phòng'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const roomRes = await roomApi.update(id, data.roomData)
      await roomApi.updateServices(id, data.servicesData)
      return roomRes.data
    },
    onSuccess: () => { message.success('Cập nhật thành công'); closeModal(); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi cập nhật'),
  })

  const deleteMutation = useMutation({
    mutationFn: roomApi.delete,
    onSuccess: () => { message.success('Xóa phòng thành công'); invalidate() },
    onError: (e) => message.error(e.response?.data?.message || 'Không thể xóa phòng này'),
  })

  const openCreate = () => {
    setEditingRoom(null)
    form.resetFields()
    form.setFieldsValue({ services: {} })
    setModalOpen(true)
  }

  const openEdit = async (room) => {
    setEditingRoom(room)
    form.setFieldsValue({
      ...room,
      tienNghi: room.tienNghi ? room.tienNghi.split(', ') : [],
      services: {}
    })
    setModalOpen(true)

    try {
      const res = await roomApi.getServices(room.id)
      const servicesMap = {}
      res.data.forEach(s => {
        servicesMap[s.dichVuId] = {
          checked: true,
          donGiaOverride: s.donGiaOverride
        }
      })
      form.setFieldsValue({ services: servicesMap })
    } catch (err) {
      message.error('Lỗi khi tải danh sách dịch vụ của phòng')
    }
  }

  const closeModal = () => { setModalOpen(false); setEditingRoom(null); form.resetFields() }

  const onFinish = (values) => {
    const roomData = {
      tenPhong: values.tenPhong,
      giaThue: values.giaThue,
      dienTich: values.dienTich,
      soNguoiToiDa: values.soNguoiToiDa,
      tienNghi: Array.isArray(values.tienNghi) ? values.tienNghi.join(', ') : values.tienNghi
    }

    const items = []
    if (values.services) {
      Object.keys(values.services).forEach(svcId => {
        const svcInfo = values.services[svcId]
        if (svcInfo && svcInfo.checked) {
          items.push({
            dichVuId: Number(svcId),
            donGiaOverride: svcInfo.donGiaOverride || null
          })
        }
      })
    }

    const servicesData = { items }

    if (editingRoom) {
      updateMutation.mutate({ id: editingRoom.id, data: { roomData, servicesData } })
    } else {
      createMutation.mutate({ roomData, servicesData })
    }
  }

  const columns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
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
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
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
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Tiện nghi" name="tienNghi">
                <Select 
                  mode="tags" 
                  placeholder="Chọn hoặc nhập tiện nghi (VD: Điều hòa, Máy giặt...)"
                  options={COMMON_FACILITIES.map(f => ({ label: f, value: f }))}
                />
              </Form.Item>

              <Typography.Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>Dịch vụ gán kèm</Typography.Title>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 8, padding: '8px 12px', marginBottom: 16, background: '#fafafa' }}>
                {allServices?.map(svc => (
                  <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Form.Item
                      name={['services', svc.id, 'checked']}
                      valuePropName="checked"
                      style={{ marginBottom: 0 }}
                    >
                      <Checkbox>
                        <span style={{ fontWeight: 500 }}>{svc.tenDichVu}</span>
                        <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                          ({Number(svc.donGiaMacDinh).toLocaleString('vi-VN')} đ/{svc.donVi})
                        </Typography.Text>
                      </Checkbox>
                    </Form.Item>
                    
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, curr) => prev?.services?.[svc.id]?.checked !== curr?.services?.[svc.id]?.checked}
                    >
                      {({ getFieldValue }) => {
                        const isChecked = getFieldValue(['services', svc.id, 'checked'])
                        return isChecked ? (
                          <Form.Item
                            name={['services', svc.id, 'donGiaOverride']}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              placeholder="Giá riêng (nếu có)"
                              style={{ width: 160 }}
                              min={0}
                              addonAfter="đ"
                              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v.replace(/\$\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        ) : null
                      }}
                    </Form.Item>
                  </div>
                ))}
              </div>
            </Col>
          </Row>

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
