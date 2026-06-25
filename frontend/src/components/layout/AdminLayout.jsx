import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, Typography, theme, Badge, List, App } from 'antd'
import {
  DashboardOutlined, HomeOutlined, TeamOutlined, FileTextOutlined,
  DollarOutlined, AppstoreOutlined, ToolOutlined,
  LogoutOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined,
  BellOutlined
} from '@ant-design/icons'
import { useAuth } from '../../store/AuthContext'
import { authApi, notificationApi } from '../../api'
import { getAvatarUrl } from '../../api/axiosInstance'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const menuItems = [
  { key: '/admin/dashboard',  icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/phong',      icon: <HomeOutlined />,      label: 'Phòng trọ' },
  { key: '/admin/khach-thue', icon: <TeamOutlined />,      label: 'Khách thuê' },
  { key: '/admin/hop-dong',   icon: <FileTextOutlined />,  label: 'Hợp đồng' },
  {
    key: 'hoa-don-submenu',
    icon: <DollarOutlined />,
    label: 'Hóa đơn',
    children: [
      { key: '/admin/hoa-don/cong-no', label: 'Công nợ theo tháng' },
      { key: '/admin/hoa-don/danh-sach', label: 'Quản lý hóa đơn' },
    ]
  },
  { key: '/admin/dich-vu',    icon: <AppstoreOutlined />,  label: 'Dịch vụ' },
  { key: '/admin/sua-chua',   icon: <ToolOutlined />,      label: 'Sửa chữa' },
]

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { token } = theme.useToken()
  const qc = useQueryClient()
  const { message, notification } = App.useApp()

  useEffect(() => {
    const jwtToken = localStorage.getItem('token')
    if (!jwtToken) return

    const getWsUrl = () => {
      const apiUrl = import.meta.env.VITE_API_URL
      if (apiUrl && apiUrl.startsWith('http')) {
        try {
          const url = new URL(apiUrl)
          const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
          return `${wsProtocol}//${url.host}/ws/notifications?token=${jwtToken}`
        } catch (e) {
          console.error('Invalid VITE_API_URL', e)
        }
      }
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${protocol}//${window.location.host}/ws/notifications?token=${jwtToken}`
    }
    const wsUrl = getWsUrl()
    
    let ws = new WebSocket(wsUrl)

    const connectWs = () => {
      ws.onopen = () => {
        console.log('WebSocket admin connected')
      }
      ws.onmessage = (event) => {
        try {
          const notificationData = JSON.parse(event.data)
          qc.invalidateQueries({ queryKey: ['admin-notifications'] })
          qc.invalidateQueries({ queryKey: ['admin-notifications-unread-count'] })
          
          notification.info({
            message: notificationData.tieuDe || 'Thông báo mới',
            description: notificationData.noiDung || '',
            placement: 'topRight',
          })
        } catch (e) {
          console.error('Error handling admin notification message', e)
        }
      }
      ws.onerror = (e) => {
        console.error('WebSocket admin error', e)
      }
      ws.onclose = () => {
        console.log('WebSocket admin disconnected, reconnecting in 5s...')
        setTimeout(() => {
          if (localStorage.getItem('token')) {
            ws = new WebSocket(wsUrl)
            connectWs()
          }
        }, 5000)
      }
    }

    connectWs()

    return () => {
      ws.close()
    }
  }, [qc, notification])

  // -- Notification Center Queries & Mutations --
  const { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => notificationApi.getAdminNotifications().then(r => r.data),
    refetchInterval: 15000,
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-notifications-unread-count'],
    queryFn: () => notificationApi.getUnreadAdminCount().then(r => r.data),
    refetchInterval: 15000,
  })

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notifications'] })
      qc.invalidateQueries({ queryKey: ['admin-notifications-unread-count'] })
    }
  })

  const readAllMutation = useMutation({
    mutationFn: notificationApi.markAllAdminAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-notifications'] })
      qc.invalidateQueries({ queryKey: ['admin-notifications-unread-count'] })
    }
  })

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
              🏠 MyRoom
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['hoa-don-submenu']}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification Center */}
            <Dropdown
              dropdownRender={() => (
                <div style={{
                  background: '#fff',
                  width: 320,
                  borderRadius: 12,
                  boxShadow: '0 6px 16px -8px rgba(0, 0, 0, 0.08), 0 9px 28px 0 rgba(0, 0, 0, 0.05), 0 12px 48px 16px rgba(0, 0, 0, 0.03)',
                  border: '1px solid #f0f0f0',
                  padding: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    <Text strong>Thông báo</Text>
                    {unreadCount > 0 && (
                      <Button type="link" size="small" onClick={() => readAllMutation.mutate()} style={{ padding: 0 }}>
                        Đọc hết
                      </Button>
                    )}
                  </div>
                  <List
                    size="small"
                    loading={loadingNotifications}
                    dataSource={notifications || []}
                    renderItem={(item) => (
                      <List.Item
                        onClick={() => markReadMutation.mutate(item.id)}
                        style={{
                          cursor: 'pointer',
                          background: item.daDoc ? 'transparent' : '#f0f9ff',
                          borderRadius: 8,
                          margin: '4px 0',
                          padding: '8px 12px',
                          transition: 'background 0.3s',
                          borderBottom: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong={!item.daDoc} style={{ fontSize: 13 }}>{item.tieuDe}</Text>
                            {!item.daDoc && <Badge status="processing" />}
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>{item.noiDung}</Text>
                          <Text type="secondary" style={{ fontSize: 10, alignSelf: 'flex-end', marginTop: 4 }}>
                            {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        </div>
                      </List.Item>
                    )}
                    locale={{ emptyText: 'Không có thông báo nào' }}
                    style={{ maxHeight: 300, overflowY: 'auto' }}
                  />
                </div>
              )}
              trigger={['click']}
              placement="bottomRight"
            >
              <Badge count={unreadCount} size="small" style={{ cursor: 'pointer' }}>
                <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              </Badge>
            </Dropdown>

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
                <Avatar src={getAvatarUrl(user?.avatarUrl)} icon={<UserOutlined />} style={{ background: token.colorPrimary }} />
                <Text>{user?.hoTen}</Text>
              </div>
            </Dropdown>
          </div>
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
