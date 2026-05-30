import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd'
import {
  HomeOutlined, DollarOutlined, FileTextOutlined, WarningOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { dashboardApi } from '../../api'

const { Title } = Typography

export default function DashboardPage() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.getOverview().then(r => r.data),
  })

  const { data: unpaid } = useQuery({
    queryKey: ['dashboard-unpaid'],
    queryFn: () => dashboardApi.getUnpaidInvoices().then(r => r.data),
  })

  const { data: expiring } = useQuery({
    queryKey: ['dashboard-expiring'],
    queryFn: () => dashboardApi.getExpiringContracts().then(r => r.data),
  })

  const expiringColumns = [
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong' },
    { title: 'Khách thuê', dataIndex: 'hoTen', key: 'hoTen' },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'ngayKetThuc',
      key: 'ngayKetThuc',
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Còn lại',
      key: 'conLai',
      render: (_, r) => {
        const days = dayjs(r.ngayKetThuc).diff(dayjs(), 'day')
        return <Tag color={days <= 7 ? 'red' : 'orange'}>{days} ngày</Tag>
      },
    },
  ]

  if (loadingOverview) return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 80 }} />

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Tổng quan</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Phòng còn trống"
              value={overview?.soPhongTrong ?? 0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Phòng đã thuê"
              value={overview?.soPhongDaThue ?? 0}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hóa đơn chưa thanh toán"
              value={unpaid?.soHoaDon ?? 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng tiền chưa thu"
              value={unpaid?.tongTien ?? 0}
              prefix="₫"
              formatter={(v) => v.toLocaleString('vi-VN')}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<><WarningOutlined style={{ color: '#fa8c16', marginRight: 8 }} />Hợp đồng sắp hết hạn (≤ 30 ngày)</>}
        style={{ marginTop: 24 }}
      >
        <Table
          rowKey="id"
          dataSource={expiring ?? []}
          columns={expiringColumns}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}
