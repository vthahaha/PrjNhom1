import { Table, Button, Tag, Typography, Space, Select, App, Popconfirm, Modal, Form, InputNumber, Descriptions } from 'antd'
import { CheckOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { invoiceApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title } = Typography

export default function InvoicesPage() {
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [settingModalOpen, setSettingModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [settingForm] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceApi.getAll().then(r => r.data),
  })

  const { data: utilityPrices } = useQuery({
    queryKey: ['utility-prices'],
    queryFn: () => invoiceApi.getUtilityPrices().then(r => r.data),
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
        </Space>
      </div>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />

      <Modal title={`Chi tiết hóa đơn tháng ${selectedInvoice?.thang}/${selectedInvoice?.nam}`} open={detailModalOpen} onCancel={() => setDetailModalOpen(false)} footer={<Button onClick={() => setDetailModalOpen(false)}>Đóng</Button>} width={600}>
        {selectedInvoice && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Phòng">{selectedInvoice.tenPhong}</Descriptions.Item>
            <Descriptions.Item label="Tiền phòng">
              <div>
                <b>{Number(selectedInvoice.tienPhong || 0).toLocaleString('vi-VN')} đ</b>
                <span style={{ fontSize: 12, color: 'gray', marginLeft: 8 }}>
                  (Chia đầu người: {Math.round((selectedInvoice.tienPhong || 0) / (selectedInvoice.soNguoiO || 1)).toLocaleString('vi-VN')} đ/người - {selectedInvoice.soNguoiO} người)
                </span>
              </div>
            </Descriptions.Item>
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
