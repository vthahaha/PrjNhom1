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
      title: 'Tiền phòng/người',
      key: 'tienPhongNguoi',
      render: (_, r) => `${Math.round((r.tienPhong || 0) / (r.soNguoiO || 1)).toLocaleString('vi-VN')} đ`,
    },
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
          <>
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
              <Descriptions.Item label="Tiền dịch vụ">
                <div>
                  <b>{Number(selectedInvoice.tienDichVu || 0).toLocaleString('vi-VN')} đ</b>
                  {selectedInvoice.chiTietDichVu && selectedInvoice.chiTietDichVu.length > 0 && (
                    <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid #d9d9d9', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {selectedInvoice.chiTietDichVu.map((dv, idx) => (
                        <div key={idx} style={{ fontSize: 12, color: 'gray' }}>
                          • {dv.tenDichVu}: <b>{Number(dv.thanhTien).toLocaleString('vi-VN')} đ</b> ({Number(dv.donGia).toLocaleString('vi-VN')} đ/{dv.donVi})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Descriptions.Item>
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

            <div style={{ marginTop: 20, padding: 16, background: '#f9f9f9', borderRadius: 12, border: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>💳 Thông tin chuyển khoản</Typography.Title>
                  <Descriptions column={1} size="small" colon={false} labelStyle={{ color: 'gray' }}>
                    <Descriptions.Item label="Chủ tài khoản:"><b>VŨ TUẤN HẢI</b></Descriptions.Item>
                    <Descriptions.Item label="Số tài khoản:"><b>0344421488</b></Descriptions.Item>
                    <Descriptions.Item label="Ngân hàng:"><b>MB Bank (Ngân hàng Quân Đội)</b></Descriptions.Item>
                    <Descriptions.Item label="Nội dung ck:">
                      <Typography.Text copyable style={{ background: '#fff', padding: '2px 6px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 12 }}>
                        {`Thanh toan tien phong ${selectedInvoice.tenPhong} thang ${selectedInvoice.thang}/${selectedInvoice.nam}`}
                      </Typography.Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
                <div style={{ textAlign: 'center', width: 150 }}>
                  <img
                    src={`https://img.vietqr.io/image/MB-0344421488-compact2.png?amount=${selectedInvoice.tongTien}&addInfo=Thanh%20toan%20tien%20phong%20${selectedInvoice.tenPhong}%20thang%20${selectedInvoice.thang}%20${selectedInvoice.nam}&accountName=VU%20TUAN%20HAI`}
                    alt="VietQR MB Bank"
                    style={{ width: 130, height: 130, objectFit: 'contain', border: '1px solid #d9d9d9', borderRadius: 8, padding: 4, background: '#fff' }}
                  />
                  <div style={{ fontSize: 10, color: 'gray', marginTop: 4 }}>Quét mã để chuyển khoản</div>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
