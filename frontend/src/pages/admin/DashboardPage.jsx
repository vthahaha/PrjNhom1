import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin, DatePicker, Space } from 'antd'
import {
  HomeOutlined, DollarOutlined, FileTextOutlined, WarningOutlined,
  RiseOutlined, FallOutlined, PieChartOutlined, BarChartOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { dashboardApi } from '../../api'
import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const { Title } = Typography

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState([dayjs().startOf('year'), dayjs().endOf('year')])

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardApi.getOverview().then(r => r.data),
  })

  const { data: financeStats } = useQuery({
    queryKey: ['dashboard-finance', dateRange[0].format('YYYY-MM-DDTHH:mm:ss'), dateRange[1].format('YYYY-MM-DDTHH:mm:ss')],
    queryFn: () => dashboardApi.getFinanceStats({
      startDate: dateRange[0].format('YYYY-MM-DDTHH:mm:ss'),
      endDate: dateRange[1].format('YYYY-MM-DDTHH:mm:ss')
    }).then(r => r.data),
  })

  const { data: unpaid } = useQuery({
    queryKey: ['dashboard-unpaid'],
    queryFn: () => dashboardApi.getUnpaidInvoices().then(r => r.data),
  })

  const { data: expiring } = useQuery({
    queryKey: ['dashboard-expiring'],
    queryFn: () => dashboardApi.getExpiringContracts().then(r => r.data),
  })

  const { data: revenueData } = useQuery({
    queryKey: ['dashboard-revenue', dateRange[0].year()],
    queryFn: () => dashboardApi.getRevenue(dateRange[0].year()).then(r => r.data),
  })

  const expiringColumns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong' },
    { title: 'Khách thuê', dataIndex: 'hoTenKhach', key: 'hoTenKhach' },
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

  const pieData = [
    { name: 'Trống', value: overview?.phongTrong ?? 0, color: '#52c41a' },
    { name: 'Đã thuê', value: overview?.phongDaThue ?? 0, color: '#1677ff' },
    { name: 'Đang sửa', value: overview?.phongDangSua ?? 0, color: '#faad14' },
  ]

  const barData = revenueData?.map(item => ({
    name: `T${item.thang}`,
    doanhThu: item.doanhThu,
  })) || []

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Tổng quan</Title>
        <Space>
          <span>Thời gian:</span>
          <DatePicker.RangePicker 
            value={dateRange} 
            onChange={(val) => val && setDateRange(val)} 
            format="DD/MM/YYYY" 
            allowClear={false}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Tình trạng phòng" style={{ height: '100%' }}>
            <Row>
              <Col span={12}>
                <Statistic
                  title="Đã thuê"
                  value={overview?.phongDaThue ?? 0}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#1677ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Còn trống"
                  value={overview?.phongTrong ?? 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Thu & Chi" style={{ height: '100%' }}>
            <Row>
              <Col span={12}>
                <Statistic
                  title="Tổng thu"
                  value={financeStats?.tongThu ?? 0}
                  prefix={<RiseOutlined />}
                  formatter={(v) => v.toLocaleString('vi-VN')}
                  valueStyle={{ color: '#52c41a' }}
                  suffix="₫"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tổng chi"
                  value={financeStats?.tongChi ?? 0}
                  prefix={<FallOutlined />}
                  formatter={(v) => v.toLocaleString('vi-VN')}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix="₫"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Thu nhập thuần" style={{ height: '100%' }}>
            <Statistic
              title="Lợi nhuận (Thu - Chi)"
              value={(financeStats?.tongThu ?? 0) - (financeStats?.tongChi ?? 0)}
              prefix={<DollarOutlined />}
              formatter={(v) => v.toLocaleString('vi-VN')}
              valueStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
          <Card title={<><BarChartOutlined style={{ marginRight: 8 }} />Doanh thu theo tháng ({dateRange[0].year()})</>} style={{ height: '100%' }}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <RechartsTooltip formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']} />
                  <Bar dataKey="doanhThu" fill="#1677ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<><PieChartOutlined style={{ marginRight: 8 }} />Tỉ lệ phòng</>} style={{ height: '100%' }}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
