import { Table, Button, Tag, Typography, Space, Select, App, Popconfirm, Input, Modal, Form, InputNumber, DatePicker, Descriptions } from 'antd'
import { CheckOutlined, PlusOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { invoiceApi, contractApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title } = Typography
const { Option } = Select

export default function InvoicesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [settingModalOpen, setSettingModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [form] = Form.useForm()
  const [settingForm] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceApi.getAll().then(r => r.data),
  })

  const { data: contracts } = useQuery({
    queryKey: ['contracts-active'],
    queryFn: () => contractApi.getAll({ trangThai: 'HIEU_LUC' }).then(r => r.data),
  })

  const { data: utilityPrices } = useQuery({
    queryKey: ['utility-prices'],
    queryFn: () => invoiceApi.getUtilityPrices().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: invoiceApi.create,
    onSuccess: () => {
      message.success('Tạo hóa đơn thành công')
      setModalOpen(false)
      form.resetFields()
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi tạo hóa đơn'),
  })

  const markPaidMutation = useMutation({
    mutationFn: invoiceApi.markPaid,
    onSuccess: () => { message.success('Đã xác nhận thanh toán'); qc.invalidateQueries({ queryKey: ['invoices'] }) },
    onError: () => message.error('Lỗi khi xác nhận'),
  })

  const setPriceMutation = useMutation({
    mutationFn: invoiceApi.setUtilityPrice,
    onSuccess: () => {
      message.success('Cập nhật đơn giá thành công')
      setSettingModalOpen(false)
      qc.invalidateQueries({ queryKey: ['utility-prices'] })
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi cập nhật đơn giá'),
  })

  const columns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong', ...getColumnSearchProps('tenPhong', 'tên phòng') },
    { title: 'Tháng/Năm', key: 'kyHoaDon', render: (_, r) => `${r.thang}/${r.nam}` },
    { title: 'Tổng tiền', dataIndex: 'tongTien', key: 'tongTien', render: v => `${Number(v).toLocaleString('vi-VN')} đ` },
    { title: 'Tiền/người', key: 'tienNguoi', render: (_, r) => `${Number(r.tongTien / (r.soNguoiO || 1)).toLocaleString('vi-VN')} đ` },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: v => <Tag color={v === 'DA_TT' ? 'green' : 'orange'}>{v === 'DA_TT' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>,
    },
    { title: 'Ngày TT', dataIndex: 'ngayThanhToan', key: 'ngayThanhToan', render: v => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
    {
      title: 'Thao tác', key: 'action',
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedInvoice(r); setDetailModalOpen(true); }}>Chi tiết</Button>
          {r.trangThai === 'CHUA_TT' && (
            <Popconfirm title="Xác nhận đã nhận tiền?" onConfirm={() => markPaidMutation.mutate(r.id)} okText="Xác nhận" cancelText="Hủy">
              <Button size="small" type="primary" icon={<CheckOutlined />}>Đã thu tiền</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const onFinish = (values) => {
    const data = {
      ...values,
      thang: values.kyHoaDon.month() + 1,
      nam: values.kyHoaDon.year()
    }
    delete data.kyHoaDon
    createMutation.mutate(data)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý hóa đơn</Title>
        <Space>
          <Button 
            icon={<SettingOutlined />} 
            onClick={() => {
              // Get the most recent utility price if exists
              const current = utilityPrices && utilityPrices.length > 0 ? utilityPrices[0] : {}
              settingForm.setFieldsValue({ donGiaDien: current.donGiaDien, donGiaNuoc: current.donGiaNuoc })
              setSettingModalOpen(true)
            }}
          >
            Cấu hình Giá Điện/Nước
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Tạo hóa đơn</Button>
        </Space>
      </div>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />

      <Modal title="Tạo hóa đơn mới" open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} footer={null} destroyOnHidden width={600}>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
          <Form.Item label="Hợp đồng" name="hopDongId" rules={[{ required: true, message: 'Vui lòng chọn hợp đồng' }]}>
            <Select placeholder="Chọn hợp đồng đang thuê" showSearch optionFilterProp="children">
              {contracts?.map(c => <Option key={c.id} value={c.id}>{c.tenPhong} — {c.hoTenKhach}</Option>)}
            </Select>
          </Form.Item>
          
          <Form.Item label="Kỳ hóa đơn (Tháng/Năm)" name="kyHoaDon" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker.MonthPicker style={{ width: '100%' }} format="MM/YYYY" />
          </Form.Item>

          <Space style={{ display: 'flex', width: '100%' }} align="start">
            <Form.Item label="Số điện đầu" name="chiSoDienDau" rules={[{ required: true }]}>
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
            <Form.Item label="Số điện cuối" name="chiSoDienCuoi" rules={[{ required: true }]}>
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex', width: '100%' }} align="start">
            <Form.Item label="Số nước đầu" name="chiSoNuocDau" rules={[{ required: true }]}>
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
            <Form.Item label="Số nước cuối" name="chiSoNuocCuoi" rules={[{ required: true }]}>
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
          </Space>

          <Form.Item label="Phụ phí (nếu có)" name="phiKhac">
            <InputNumber style={{ width: '100%' }} min={0} step={10000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="Ghi chú phụ phí" name="ghiChuPhiKhac">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields() }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo hóa đơn</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`Chi tiết hóa đơn tháng ${selectedInvoice?.thang}/${selectedInvoice?.nam}`} open={detailModalOpen} onCancel={() => setDetailModalOpen(false)} footer={<Button onClick={() => setDetailModalOpen(false)}>Đóng</Button>} width={600}>
        {selectedInvoice && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Phòng">{selectedInvoice.tenPhong}</Descriptions.Item>
            <Descriptions.Item label="Tiền phòng">{Number(selectedInvoice.tienPhong || 0).toLocaleString('vi-VN')} đ</Descriptions.Item>
            <Descriptions.Item label="Tiền điện">
              {Number(selectedInvoice.tienDien || 0).toLocaleString('vi-VN')} đ
              <br/>
              <span style={{ fontSize: 12, color: 'gray' }}>(Chỉ số: {selectedInvoice.chiSoDienDau} - {selectedInvoice.chiSoDienCuoi})</span>
            </Descriptions.Item>
            <Descriptions.Item label="Tiền nước">
              {Number(selectedInvoice.tienNuoc || 0).toLocaleString('vi-VN')} đ
              <br/>
              <span style={{ fontSize: 12, color: 'gray' }}>(Chỉ số: {selectedInvoice.chiSoNuocDau} - {selectedInvoice.chiSoNuocCuoi})</span>
            </Descriptions.Item>
            <Descriptions.Item label="Tiền dịch vụ">{Number(selectedInvoice.tienDichVu || 0).toLocaleString('vi-VN')} đ</Descriptions.Item>
            {selectedInvoice.phiKhac > 0 && (
              <Descriptions.Item label="Phụ phí">
                {Number(selectedInvoice.phiKhac).toLocaleString('vi-VN')} đ 
                {selectedInvoice.ghiChuPhiKhac && ` (${selectedInvoice.ghiChuPhiKhac})`}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Tổng tiền">
              <Typography.Text strong type="danger" style={{ fontSize: 18 }}>
                {Number(selectedInvoice.tongTien || 0).toLocaleString('vi-VN')} đ
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal title="Cài đặt Đơn giá Điện/Nước" open={settingModalOpen} onCancel={() => setSettingModalOpen(false)} footer={null} destroyOnHidden>
        <Form form={settingForm} layout="vertical" onFinish={(v) => setPriceMutation.mutate({ ...v, apDungTu: dayjs().format('YYYY-MM-DD') })} style={{ marginTop: 16 }}>
          <Form.Item label="Đơn giá Điện (VNĐ/kWh)" name="donGiaDien" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={100} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="Đơn giá Nước (VNĐ)" name="donGiaNuoc" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={1000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setSettingModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={setPriceMutation.isPending}>Lưu thay đổi</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
