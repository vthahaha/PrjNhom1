import { Table, Tag, Typography, Button, Space, Modal, Descriptions } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { invoiceApi } from '../../api'

const { Title } = Typography

export default function MyInvoicesPage() {
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => invoiceApi.getMyInvoices().then(r => r.data),
  })

  const columns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Tháng/Năm', key: 'ky', render: (_, r) => `${r.thang}/${r.nam}` },
    { title: 'Tổng tiền', dataIndex: 'tongTien', key: 'tongTien', render: v => `${Number(v).toLocaleString('vi-VN')} đ` },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: v => <Tag color={v === 'DA_TT' ? 'green' : 'orange'}>{v === 'DA_TT' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>,
    },
    { title: 'Ngày TT', dataIndex: 'ngayThanhToan', key: 'ngayThanhToan', render: v => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
    {
      title: 'Chi tiết', key: 'action',
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedInvoice(r); setDetailModalOpen(true); }}>Xem</Button>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Hóa đơn của tôi</Title>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />

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
    </div>
  )
}
