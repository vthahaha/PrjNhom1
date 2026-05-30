import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, theme } from 'antd'
import {
  FileTextOutlined, DollarOutlined, ToolOutlined,
  UserOutlined, LogoutOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../store/AuthContext'
import { authApi } from '../../api'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/tenant/hop-dong', icon: <FileTextOutlined />, label: 'Hợp đồng của tôi' },
  { key: '/tenant/hoa-don',  icon: <DollarOutlined />,   label: 'Hóa đơn' },
  { key: '/tenant/sua-chua', icon: <ToolOutlined />,     label: 'Yêu cầu sửa chữa' },
  { key: '/tenant/thong-tin',icon: <UserOutlined />,     label: 'Thông tin cá nhân' },
]

export default function TenantLayout() {
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
        width={220}
        style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Text strong style={{ fontSize: 14, color: token.colorPrimary }}>🏠 Phòng Trọ</Text>
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
          justifyContent: 'flex-end',
        }}>
          <Dropdown
            menu={{ items: userMenu, onClick: ({ key }) => key === 'logout' && handleLogout() }}
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <Text>{user?.hoTen}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
