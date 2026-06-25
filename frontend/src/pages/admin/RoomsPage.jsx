import { useState } from 'react'
import {
  Table, Button, Tag, Input, Select, Space, Modal, Form,
  InputNumber, Typography, App, Popconfirm, Checkbox, Row, Col, Tabs, Descriptions, Card
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
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
  
  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailRoomId, setDetailRoomId] = useState(null)

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

  // Fetch detailed room info for the detail modal
  const { data: roomDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['room-detail', detailRoomId],
    queryFn: () => roomApi.getRoomDetail(detailRoomId).then(r => r.data),
    enabled: !!detailRoomId,
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
          donGiaOverride: s.donGiaOverride,
          soLuong: s.soLuong || 1
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
            donGiaOverride: svcInfo.donGiaOverride || null,
            soLuong: svcInfo.soLuong || 1
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
          <Button size="small" icon={<InfoCircleOutlined />} onClick={() => { setDetailRoomId(record.id); setDetailModalOpen(true); }}>Chi tiết</Button>
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

  const detailTabs = roomDetail ? [
    {
      key: 'roomInfo',
      label: 'Thông tin & Hợp đồng',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Descriptions title="Chi tiết phòng trọ" bordered column={2} size="small">
            <Descriptions.Item label="Tên phòng">{roomDetail.room?.tenPhong}</Descriptions.Item>
            <Descriptions.Item label="Giá thuê">{Number(roomDetail.room?.giaThue || 0).toLocaleString('vi-VN')} đ/tháng</Descriptions.Item>
            <Descriptions.Item label="Diện tích">{roomDetail.room?.dienTich} m²</Descriptions.Item>
            <Descriptions.Item label="Số người tối đa">{roomDetail.room?.soNguoiToiDa || 'Không giới hạn'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <Tag color={trangThaiConfig[roomDetail.room?.trangThai]?.color}>
                {trangThaiConfig[roomDetail.room?.trangThai]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tiện nghi" span={2}>{roomDetail.room?.tienNghi || 'Không có'}</Descriptions.Item>
          </Descriptions>

          {roomDetail.activeContract ? (
            <Descriptions title="Hợp đồng đang hiệu lực" bordered column={2} size="small">
              <Descriptions.Item label="Khách thuê">{roomDetail.activeContract.hoTenKhach}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{roomDetail.activeContract.soDienThoaiKhach}</Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">{dayjs(roomDetail.activeContract.ngayBatDau).format('DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">{dayjs(roomDetail.activeContract.ngayKetThuc).format('DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Tiền đặt cọc">{Number(roomDetail.activeContract.tienCoc || 0).toLocaleString('vi-VN')} đ</Descriptions.Item>
              <Descriptions.Item label="Số người ở">{roomDetail.activeContract.soNguoiO} người</Descriptions.Item>
              <Descriptions.Item label="Kỳ đóng tiền">{roomDetail.activeContract.kyDongTien} tháng/lần</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="green">Đang hiệu lực</Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Card style={{ textAlign: 'center', background: '#fafafa', borderRadius: 8 }}>
              <Typography.Text type="secondary">Phòng hiện tại chưa có hợp đồng thuê hoạt động.</Typography.Text>
            </Card>
          )}
        </Space>
      )
    },
    {
      key: 'invoices',
      label: 'Hóa đơn gần đây',
      children: (
        <Table
          size="small"
          rowKey="id"
          dataSource={roomDetail.recentInvoices || []}
          pagination={{ pageSize: 5 }}
          columns={[
            { title: 'Tháng/Năm', key: 'ky', render: (_, r) => `${r.thang}/${r.nam}` },
            { title: 'Tổng tiền', dataIndex: 'tongTien', render: v => `${Number(v).toLocaleString('vi-VN')} đ` },
            { 
              title: 'Trạng thái', 
              dataIndex: 'trangThai',
              render: v => <Tag color={v === 'DA_TT' ? 'green' : 'orange'}>{v === 'DA_TT' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>
            },
            { title: 'Ngày thanh toán', dataIndex: 'ngayThanhToan', render: v => v ? dayjs(v).format('DD/MM/YYYY') : '—' }
          ]}
        />
      )
    },
    {
      key: 'repairs',
      label: 'Lịch sử sửa chữa',
      children: (
        <Table
          size="small"
          rowKey="id"
          dataSource={roomDetail.recentRepairRequests || []}
          pagination={{ pageSize: 5 }}
          columns={[
            { title: 'Nội dung', dataIndex: 'moTa' },
            { 
              title: 'Trạng thái', 
              dataIndex: 'trangThai',
              render: v => {
                const map = {
                  CHO_XU_LY: { color: 'orange', text: 'Chờ xử lý' },
                  DANG_XU_LY: { color: 'blue', text: 'Đang xử lý' },
                  DA_XU_LY: { color: 'green', text: 'Đã hoàn thành' }
                }
                return <Tag color={map[v]?.color || 'default'}>{map[v]?.text || v}</Tag>
              }
            },
            { title: 'Chi phí', dataIndex: 'chiPhi', render: v => v ? `${Number(v).toLocaleString('vi-VN')} đ` : '—' },
            { title: 'Ngày yêu cầu', dataIndex: 'createdAt', render: v => dayjs(v).format('DD/MM/YYYY HH:mm') }
          ]}
        />
      )
    }
  ] : []

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
              <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 8, padding: '8px 12px', marginBottom: 16, background: '#fafafa' }}>
                {allServices?.map(svc => (
                  <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
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
                          <Space style={{ display: 'flex', gap: 8 }}>
                            <Form.Item
                              name={['services', svc.id, 'soLuong']}
                              style={{ marginBottom: 0 }}
                              initialValue={1}
                            >
                              <InputNumber
                                placeholder="Số lượng"
                                style={{ width: 90 }}
                                min={1}
                                addonBefore="SL"
                              />
                            </Form.Item>
                            <Form.Item
                              name={['services', svc.id, 'donGiaOverride']}
                              style={{ marginBottom: 0 }}
                            >
                              <InputNumber
                                placeholder="Giá riêng"
                                style={{ width: 130 }}
                                min={0}
                                addonAfter="đ"
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(v) => v.replace(/\$\s?|(,*)/g, '')}
                              />
                            </Form.Item>
                          </Space>
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

      <Modal
        title="Tổng quan chi tiết phòng trọ"
        open={detailModalOpen}
        onCancel={() => { setDetailModalOpen(false); setDetailRoomId(null); }}
        footer={[
          <Button key="close" onClick={() => { setDetailModalOpen(false); setDetailRoomId(null); }}>Đóng</Button>
        ]}
        width={750}
        loading={isLoadingDetail}
        destroyOnClose
      >
        {roomDetail && (
          <Tabs defaultActiveKey="roomInfo" items={detailTabs} style={{ marginTop: 16 }} />
        )}
      </Modal>
    </div>
  )
}

