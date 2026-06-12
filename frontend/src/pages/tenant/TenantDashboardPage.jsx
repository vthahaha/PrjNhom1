import { Row, Col, Card, Statistic, Typography, Spin, Alert, Empty } from 'antd'
import { HomeOutlined, DollarOutlined, ThunderboltOutlined, ToolOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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

  // Chart data processing
  const paidSortedInvoices = [...paidInvoices].sort((a, b) => {
    if (a.nam !== b.nam) return a.nam - b.nam
    return a.thang - b.thang
  })

  const barChartData = paidSortedInvoices.map(inv => ({
    name: `Tháng ${inv.thang}/${inv.nam}`,
    'Tiền phòng': inv.tienPhong || 0,
    'Tiền điện': inv.tienDien || 0,
    'Tiền nước': inv.tienNuoc || 0,
    'Tiền dịch vụ': inv.tienDichVu || 0,
    'Chi phí khác': inv.phiKhac || 0,
  }))

  let totalRoomRent = 0
  let totalElectricity = 0
  let totalWater = 0
  let totalServices = 0
  let totalOthers = 0

  paidInvoices.forEach(inv => {
    totalRoomRent += inv.tienPhong || 0
    totalElectricity += inv.tienDien || 0
    totalWater += inv.tienNuoc || 0
    totalServices += inv.tienDichVu || 0
    totalOthers += inv.phiKhac || 0
  })

  const pieChartData = [
    { name: 'Tiền phòng', value: totalRoomRent, color: '#1677ff' },
    { name: 'Tiền điện', value: totalElectricity, color: '#faad14' },
    { name: 'Tiền nước', value: totalWater, color: '#13c2c2' },
    { name: 'Tiền dịch vụ', value: totalServices, color: '#52c41a' },
    { name: 'Chi phí khác', value: totalOthers, color: '#ff4d4f' },
  ].filter(item => item.value > 0)

  const customTooltipFormatter = (value) => `${Number(value).toLocaleString('vi-VN')} ₫`

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
          <Card style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
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
          <Card style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
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
          <Card style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
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
          <Card style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
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

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={15}>
          <Card title="Phân tích chi phí hàng tháng" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            {barChartData.length > 0 ? (
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toLocaleString('vi-VN')}k`} />
                    <Tooltip formatter={customTooltipFormatter} contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Bar dataKey="Tiền phòng" stackId="a" fill="#1677ff" />
                    <Bar dataKey="Tiền điện" stackId="a" fill="#faad14" />
                    <Bar dataKey="Tiền nước" stackId="a" fill="#13c2c2" />
                    <Bar dataKey="Tiền dịch vụ" stackId="a" fill="#52c41a" />
                    <Bar dataKey="Chi phí khác" stackId="a" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu hóa đơn" style={{ padding: '60px 0' }} />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card title="Cơ cấu chi tiêu tích lũy" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            {pieChartData.length > 0 ? (
              <div style={{ width: '100%', height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={customTooltipFormatter} contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', marginTop: 12 }}>
                  {pieChartData.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, marginRight: 6 }}></span>
                      <span>{item.name}: <b>{((item.value / totalSpent) * 100).toFixed(1)}%</b></span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu chi tiêu" style={{ padding: '60px 0' }} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
