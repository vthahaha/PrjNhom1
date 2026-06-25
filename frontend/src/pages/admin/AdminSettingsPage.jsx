import { useState } from 'react'
import { Form, Input, Button, Typography, App, Spin, Layout, Menu, Avatar, Upload, Row, Col } from 'antd'
import { UserOutlined, UploadOutlined, SafetyOutlined, HomeOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantApi, authApi } from '../../api'
import { getAvatarUrl } from '../../api/axiosInstance'
import { useAuth } from '../../store/AuthContext'

const { Title, Text } = Typography
const { Sider, Content } = Layout

export default function AdminSettingsPage() {
  const [selectedKey, setSelectedKey] = useState('avatar')
  const [formPassword] = Form.useForm()
  const { message } = App.useApp()
  const { updateUser } = useAuth()
  const qc = useQueryClient()

  // Fetch admin profile (avatarUrl, hoTen, email etc.)
  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => tenantApi.getMe().then(r => r.data),
  })

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => { 
      message.success('Đổi mật khẩu thành công')
      formPassword.resetFields() 
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi đổi mật khẩu'),
  })

  // -- Avatar Upload Logic --
  const uploadAvatarMutation = useMutation({
    mutationFn: tenantApi.updateAvatar,
    onSuccess: (res) => {
      message.success('Cập nhật ảnh đại diện thành công')
      updateUser({ avatarUrl: res.data.avatarUrl })
      qc.invalidateQueries({ queryKey: ['my-profile'] })
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi tải ảnh đại diện'),
  })

  const handleAvatarUpload = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    uploadAvatarMutation.mutate(formData)
    return false // Prevent automatic upload
  }

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 80 }} />

  const renderAvatarSection = () => (
    <div>
      <Title level={5} style={{ marginBottom: 24 }}>Ảnh đại diện admin</Title>
      <Row gutter={[32, 32]} align="top">
        <Col xs={24} md={8} style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0', paddingRight: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Avatar
              size={120}
              src={getAvatarUrl(data?.avatarUrl)}
              icon={<UserOutlined />}
              style={{ border: '3px solid #1890ff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </div>
          <Upload
            showUploadList={false}
            beforeUpload={handleAvatarUpload}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />} loading={uploadAvatarMutation.isPending}>
              Thay ảnh đại diện
            </Button>
          </Upload>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Định dạng: PNG, JPG, JPEG</Text>
          </div>
        </Col>
        <Col xs={24} md={16} style={{ paddingLeft: 32 }}>
          <div style={{ maxWidth: 450 }}>
            <Text type="secondary">
              Thay đổi ảnh đại diện tài khoản quản trị của bạn. Ảnh này sẽ được hiển thị ở góc phải phía trên thanh điều hướng.
            </Text>
          </div>
        </Col>
      </Row>
    </div>
  )

  const renderPasswordForm = () => (
    <div style={{ maxWidth: 400 }}>
      <Title level={5} style={{ marginBottom: 24 }}>Đổi mật khẩu</Title>
      <Form
        form={formPassword}
        layout="vertical"
        onFinish={(v) => changePasswordMutation.mutate(v)}
      >
        <Form.Item label="Mật khẩu cũ" name="matKhauCu" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item label="Mật khẩu mới" name="matKhauMoi" rules={[{ required: true, min: 8, message: 'Tối thiểu 8 ký tự' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item 
          label="Xác nhận mật khẩu" 
          name="xacNhanMatKhau" 
          dependencies={['matKhauMoi']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('matKhauMoi') === value) return Promise.resolve()
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
              }
            })
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={changePasswordMutation.isPending} block>
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  )

  const renderLandlordInfo = () => (
    <div>
      <Title level={5} style={{ marginBottom: 24 }}>Thông tin nhà trọ & Địa chỉ</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 200px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: 16,
            borderRadius: 12,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: '1px solid #e1e8ed'
          }}>
            <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 4 }}>👤 Chủ nhà trọ</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1a365d' }}>Vũ Tuấn Hải</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>SĐT: 0344421488 (MB Bank)</div>
          </div>

          <div style={{
            flex: '1 1 200px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            padding: 16,
            borderRadius: 12,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: 13, color: '#0369a1', marginBottom: 4 }}>📍 Địa chỉ hiển thị</div>
            <div style={{ fontSize: 13, color: '#0f172a', fontWeight: '500', lineHeight: 1.4 }}>
              Chung cư Trương Định Complex, ngõ 129D Trương Định, phường Tương Mai, thành phố Hà Nội
            </div>
          </div>
        </div>
        
        <div style={{ height: 260, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <iframe
            title="Bản đồ nhà trọ"
            src="https://maps.google.com/maps?q=Chung%20c%C6%B0%20Tr%C6%B0%C6%A1ng%20%C4%90%E1%BB%8Bnh%20Complex,%20ng%C3%B5%20129D%20Tr%C6%B0%C6%A1ng%20%C4%90%E1%BB%8Bnh,%20ph%C6%B0%E1%BB%9Dng%20T%C6%B0%C6%A1ng%20Mai,%20H%C3%A0%20N%E1%BB%99i&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  )

  const menuItems = [
    { key: 'avatar', icon: <UserOutlined />, label: 'Ảnh đại diện' },
    { key: 'password', icon: <SafetyOutlined />, label: 'Đổi mật khẩu' },
    { key: 'info', icon: <HomeOutlined />, label: 'Thông tin & Địa chỉ' }
  ]

  return (
    <div style={{ maxWidth: 1000 }}>
      <Title level={4} style={{ marginBottom: 24 }}>Cài đặt hệ thống</Title>
      
      <Layout style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', minHeight: 450, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
        <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => setSelectedKey(key)}
            items={menuItems}
            style={{ height: '100%', borderRight: 0, paddingTop: 16 }}
          />
        </Sider>
        <Content style={{ padding: '32px 40px', background: '#fff' }}>
          {selectedKey === 'avatar' && renderAvatarSection()}
          {selectedKey === 'password' && renderPasswordForm()}
          {selectedKey === 'info' && renderLandlordInfo()}
        </Content>
      </Layout>
    </div>
  )
}
