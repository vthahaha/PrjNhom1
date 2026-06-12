import { useState } from 'react'
import { Table, Button, Tag, Typography, Space, DatePicker, App, Modal, Form, Input, InputNumber, Popconfirm, Card, Statistic, Col, Row, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, MailOutlined, SendOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { invoiceApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title, Text } = Typography

export default function MonthlyDebtsPage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const thang = currentMonth.month() + 1
  const nam = currentMonth.year()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices-monthly', thang, nam],
    queryFn: () => invoiceApi.getAll({ thang, nam }).then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['invoices-monthly', thang, nam] })

  const generateMutation = useMutation({
    mutationFn: () => invoiceApi.generateMonthly(thang, nam),
    onSuccess: () => {
      message.success(`Đã khởi tạo công nợ cho các phòng trong tháng ${thang}/${nam}`)
      invalidate()
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi khởi tạo công nợ'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => invoiceApi.update(id, data),
    onSuccess: () => {
      message.success('Cập nhật chỉ số thành công')
      setEditModalOpen(false)
      form.resetFields()
      invalidate()
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi cập nhật'),
  })

  const sendEmailMutation = useMutation({
    mutationFn: invoiceApi.sendInvoice,
    onSuccess: () => {
      message.success('Đã gửi email hóa đơn thành công')
      invalidate()
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi gửi email'),
  })

  const sendBulkMutation = useMutation({
    mutationFn: () => invoiceApi.sendBulk(thang, nam),
    onSuccess: () => {
      message.success('Đã gửi email hóa đơn hàng loạt thành công')
      invalidate()
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi gửi hàng loạt'),
  })

  const handleEditClick = (record) => {
    setSelectedInvoice(record)
    form.setFieldsValue({
      chiSoDienDau: record.chiSoDienDau,
      chiSoDienCuoi: record.chiSoDienCuoi,
      chiSoNuocDau: record.chiSoNuocDau,
      chiSoNuocCuoi: record.chiSoNuocCuoi,
      phiKhac: record.phiKhac,
      ghiChuPhiKhac: record.ghiChuPhiKhac,
    })
    setEditModalOpen(true)
  }

  const handleSave = (values) => {
    const payload = {
      ...values,
      hopDongId: selectedInvoice.hopDongId,
      thang: selectedInvoice.thang,
      nam: selectedInvoice.nam,
    }
    updateMutation.mutate({ id: selectedInvoice.id, data: payload })
  }

  // Calculate statistics
  const totalRooms = data?.length || 0
  const sentCount = data?.filter(i => i.daGui).length || 0
  const unsentCount = totalRooms - sentCount

  const columns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong', width: 100, ...getColumnSearchProps('tenPhong', 'tên phòng') },
    { 
      title: 'Điện (Chỉ số)', 
      key: 'dien', 
      width: 140,
      render: (_, r) => (
        <div>
          <Text type="secondary">Cũ: </Text><b>{r.chiSoDienDau}</b><br/>
          <Text type="secondary">Mới: </Text><b>{r.chiSoDienCuoi}</b><br/>
          <Text type="warning" style={{ fontSize: 12 }}>(Tiêu thụ: {(r.chiSoDienCuoi - r.chiSoDienDau).toFixed(1)} kWh)</Text>
        </div>
      ) 
    },
    { 
      title: 'Nước (Chỉ số)', 
      key: 'nuoc', 
      width: 140,
      render: (_, r) => (
        <div>
          <Text type="secondary">Cũ: </Text><b>{r.chiSoNuocDau}</b><br/>
          <Text type="secondary">Mới: </Text><b>{r.chiSoNuocCuoi}</b><br/>
          <Text type="warning" style={{ fontSize: 12 }}>(Tiêu thụ: {(r.chiSoNuocCuoi - r.chiSoNuocDau).toFixed(1)} m³)</Text>
        </div>
      ) 
    },
    {
      title: 'Tiền phòng',
      key: 'tienPhong',
      width: 180,
      render: (_, r) => {
        const perPerson = Math.round(r.tienPhong / (r.soNguoiO || 1))
        return (
          <div>
            <b>{Number(r.tienPhong).toLocaleString('vi-VN')} đ</b><br/>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chia đầu người:<br/>
              <b>{perPerson.toLocaleString('vi-VN')} đ</b>/người ({r.soNguoiO} người)
            </Text>
          </div>
        )
      }
    },
    { 
      title: 'Tổng cộng', 
      dataIndex: 'tongTien', 
      key: 'tongTien', 
      width: 120,
      render: v => <Text strong type="danger">{Number(v).toLocaleString('vi-VN')} đ</Text> 
    },
    {
      title: 'Gửi hóa đơn',
      dataIndex: 'daGui',
      key: 'daGui',
      width: 120,
      align: 'center',
      render: v => v ? <Tag color="green">Đã gửi email</Tag> : <Tag color="default">Chưa gửi</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      render: (_, r) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEditClick(r)}
            disabled={r.trangThai === 'DA_TT'}
          >
            Chỉ số
          </Button>
          <Tooltip title={r.trangThai === 'DA_TT' ? 'Hóa đơn đã thanh toán' : 'Gửi email chi tiết hóa đơn đến khách thuê'}>
            <Button 
              size="small" 
              type="primary" 
              ghost
              icon={<SendOutlined />} 
              onClick={() => sendEmailMutation.mutate(r.id)}
              loading={sendEmailMutation.isPending && selectedInvoice?.id === r.id}
            >
              Gửi hóa đơn
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Quản lý công nợ theo tháng</Title>
          <Text type="secondary">Khởi tạo công nợ hàng tháng, cập nhật điện nước và gửi hóa đơn cho khách</Text>
        </div>
        <Space>
          <DatePicker.MonthPicker 
            value={currentMonth} 
            onChange={(m) => m && setCurrentMonth(m)} 
            format="MM/YYYY" 
            allowClear={false}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => generateMutation.mutate()}
            loading={generateMutation.isPending}
          >
            Khởi tạo công nợ tháng
          </Button>
          {totalRooms > 0 && (
            <Popconfirm 
              title="Xác nhận gửi email hóa đơn hàng loạt cho tất cả các phòng?" 
              onConfirm={() => sendBulkMutation.mutate()} 
              okText="Gửi" 
              cancelText="Hủy"
            >
              <Button 
                type="primary"
                danger
                icon={<MailOutlined />} 
                loading={sendBulkMutation.isPending}
              >
                Gửi hóa đơn hàng loạt
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card bordered={false} className="glass-panel" style={{ borderRadius: 12, padding: '10px 0' }}>
            <Statistic title="Tổng phòng cần thu tháng này" value={totalRooms} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="glass-panel" style={{ borderRadius: 12, padding: '10px 0' }}>
            <Statistic title="Đã gửi hóa đơn" value={sentCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="glass-panel" style={{ borderRadius: 12, padding: '10px 0' }}>
            <Statistic title="Chưa gửi hóa đơn" value={unsentCount} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Table 
        rowKey="id" 
        dataSource={data ?? []} 
        columns={columns} 
        loading={isLoading} 
        pagination={{ pageSize: 10 }} 
        bordered
      />

      <Modal 
        title={`Cập nhật chỉ số dịch vụ - Phòng ${selectedInvoice?.tenPhong}`} 
        open={editModalOpen} 
        onCancel={() => { setEditModalOpen(false); form.resetFields() }} 
        footer={null} 
        destroyOnClose
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Kỳ hóa đơn: Tháng {selectedInvoice?.thang}/{selectedInvoice?.nam}
          </Text>

          <Card title="Chỉ số điện (kWh)" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Số điện đầu" name="chiSoDienDau" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Số điện cuối" name="chiSoDienCuoi" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title="Chỉ số nước (m³)" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Số nước đầu" name="chiSoNuocDau" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Số nước cuối" name="chiSoNuocCuoi" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item label="Phí phát sinh khác (nếu có)" name="phiKhac">
            <InputNumber style={{ width: '100%' }} min={0} step={1000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item label="Ghi chú phí phát sinh" name="ghiChuPhiKhac">
            <Input.TextArea rows={2} placeholder="Nêu lý do thu thêm phụ phí..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => { setEditModalOpen(false); form.resetFields() }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>Cập nhật công nợ</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
