import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, Typography, theme } from 'antd'
import {
  DashboardOutlined, HomeOutlined, TeamOutlined, FileTextOutlined,
  DollarOutlined, AppstoreOutlined, ToolOutlined,
  LogoutOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined
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
    { key: '/admin/cai-dat', icon: <SettingOutlined />, label: 'Cài đặt' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }} className="animated-bg">
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        style={{ 
          background: 'rgba(255, 255, 255, 0.4)', 
          backdropFilter: 'blur(16px)',
          borderRight: `1px solid rgba(255,255,255,0.6)` 
        }}
      >
        <div style={{ padding: '20px 16px', textAlign: 'center', borderBottom: `1px solid rgba(255,255,255,0.6)` }}>
          {!collapsed && (
            <Text strong className="gradient-text" style={{ fontSize: 18, fontWeight: 700 }}>
              🏠 Quản Lý Phòng Trọ
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', border: 'none', marginTop: 12 }}
        />
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        <Header style={{
          padding: '0 24px',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid rgba(255,255,255,0.6)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown
            menu={{ 
              items: userMenu, 
              onClick: ({ key }) => {
                if (key === 'logout') handleLogout()
                else navigate(key)
              } 
            }}
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
              <Text>{user?.hoTen}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: '24px', minHeight: 'calc(100vh - 112px)', animation: 'fade-in-up 0.4s ease-out' }}>
          <div className="glass-panel" style={{ padding: 24, borderRadius: 16, minHeight: '100%' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}
