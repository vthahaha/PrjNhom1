import { Table, Button, Tag, Typography, Space, Select, App, Popconfirm, Input } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { invoiceApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title } = Typography
const { Option } = Select

export default function InvoicesPage() {
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoiceApi.getAll().then(r => r.data),
  })

  const markPaidMutation = useMutation({
    mutationFn: invoiceApi.markPaid,
    onSuccess: () => { message.success('Đã xác nhận thanh toán'); qc.invalidateQueries({ queryKey: ['invoices'] }) },
    onError: () => message.error('Lỗi khi xác nhận'),
  })

  const columns = [
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
      render: (_, r) => r.trangThai === 'CHUA_TT' && (
        <Popconfirm title="Xác nhận đã nhận tiền?" onConfirm={() => markPaidMutation.mutate(r.id)} okText="Xác nhận" cancelText="Hủy">
          <Button size="small" type="primary" icon={<CheckOutlined />}>Đã thu tiền</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Quản lý hóa đơn</Title>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />
    </div>
  )
}
