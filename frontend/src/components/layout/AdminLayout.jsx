import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, Typography, theme } from 'antd'
import {
  DashboardOutlined, HomeOutlined, TeamOutlined, FileTextOutlined,
  DollarOutlined, AppstoreOutlined, ToolOutlined,
  LogoutOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../store/AuthContext'
import { authApi } from '../../api'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/admin/dashboard',  icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/phong',      icon: <HomeOutlined />,      label: 'Phòng trọ' },
  { key: '/admin/khach-thue', icon: <TeamOutlined />,      label: 'Khách thuê' },
  { key: '/admin/hop-dong',   icon: <FileTextOutlined />,  label: 'Hợp đồng' },
  { key: '/admin/hoa-don',    icon: <DollarOutlined />,    label: 'Hóa đơn' },
  { key: '/admin/dich-vu',    icon: <AppstoreOutlined />,  label: 'Dịch vụ' },
  { key: '/admin/sua-chua',   icon: <ToolOutlined />,      label: 'Sửa chữa' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { token } = theme.useToken()

  const handleLogout = async () => {
    try { await authApi.logout() } catch (_) {}
    logout()
    navigate('/login')
  }

  const userMenu = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          {!collapsed && (
            <Text strong style={{ fontSize: 14, color: token.colorPrimary }}>
              🏠 Quản Lý Phòng Trọ
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px',
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown
            menu={{ items: userMenu, onClick: ({ key }) => key === 'logout' && handleLogout() }}
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
              <Text>{user?.hoTen}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
