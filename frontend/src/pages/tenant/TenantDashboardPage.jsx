import { Row, Col, Card, Statistic, Typography, Spin, Alert } from 'antd'
import { HomeOutlined, DollarOutlined, ThunderboltOutlined, ToolOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { contractApi, invoiceApi, repairApi } from '../../api'

const { Title } = Typography

export default function TenantDashboardPage() {
  const { data: contract, isLoading: loadingContract } = useQuery({
    queryKey: ['my-contract'],
    queryFn: () => contractApi.getMyContract().then(r => r.data).catch(() => null),
  })

  const { data: invoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => invoiceApi.getMyInvoices().then(r => r.data).catch(() => []),
  })

  const { data: repairs, isLoading: loadingRepairs } = useQuery({
    queryKey: ['my-repairs'],
    queryFn: () => repairApi.getMine().then(r => r.data).catch(() => []),
  })

  if (loadingContract || loadingInvoices || loadingRepairs) {
    return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />
  }

  // Calculate statistics
  let daysRented = 0
  if (contract && contract.ngayBatDau) {
    daysRented = dayjs().diff(dayjs(contract.ngayBatDau), 'day')
    if (daysRented < 0) daysRented = 0
  }

  const paidInvoices = invoices?.filter(i => i.trangThai === 'DA_TT') || []
  
  // Total money spent
  const totalSpent = paidInvoices.reduce((sum, inv) => sum + (inv.tongTien || 0), 0)
  
  // Total electricity and water
  const totalUtilities = paidInvoices.reduce((sum, inv) => sum + (inv.tienDien || 0) + (inv.tienNuoc || 0), 0)

  // Total repair requests
  const totalRepairs = repairs?.length || 0

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Tổng quan cá nhân</Title>
      
      {!contract && (
        <Alert
          message="Bạn hiện chưa có hợp đồng thuê phòng nào đang hoạt động."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Thời gian thuê phòng"
              value={daysRented}
              suffix="ngày"
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Tổng tiền đã chi"
              value={totalSpent}
              suffix="₫"
              prefix={<DollarOutlined />}
              formatter={(v) => v.toLocaleString('vi-VN')}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Tiền điện nước đã trả"
              value={totalUtilities}
              suffix="₫"
              prefix={<ThunderboltOutlined />}
              formatter={(v) => v.toLocaleString('vi-VN')}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Yêu cầu sửa chữa"
              value={totalRepairs}
              suffix="lần"
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
