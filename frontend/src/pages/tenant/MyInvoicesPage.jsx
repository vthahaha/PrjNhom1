import { Table, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { invoiceApi } from '../../api'

const { Title } = Typography

export default function MyInvoicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => invoiceApi.getMyInvoices().then(r => r.data),
  })

  const columns = [
    { title: 'Tháng/Năm', key: 'ky', render: (_, r) => `${r.thang}/${r.nam}` },
    { title: 'Tổng tiền', dataIndex: 'tongTien', key: 'tongTien', render: v => `${Number(v).toLocaleString('vi-VN')} đ` },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: v => <Tag color={v === 'DA_TT' ? 'green' : 'orange'}>{v === 'DA_TT' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Tag>,
    },
    { title: 'Ngày TT', dataIndex: 'ngayThanhToan', key: 'ngayThanhToan', render: v => v ? dayjs(v).format('DD/MM/YYYY') : '—' },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Hóa đơn của tôi</Title>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />
    </div>
  )
}
