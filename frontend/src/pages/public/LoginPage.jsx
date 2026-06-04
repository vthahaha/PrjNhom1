import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api'
import { useAuth } from '../../store/AuthContext'

const { Title, Text } = Typography

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { message } = App.useApp()

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      login(data)
      if (data.doiMkLanDau) {
        navigate('/first-login')
      } else if (data.vaiTro === 'ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/tenant/hop-dong')
      }
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Sai số điện thoại hoặc mật khẩu')
    },
  })

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      <Card style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 4 }}>🏠 Quản Lý Phòng Trọ</Title>
          <Text type="secondary">Đăng nhập để tiếp tục</Text>
        </div>

        <Form layout="vertical" onFinish={(values) => mutation.mutate(values)} size="large">
          <Form.Item
            name="soDienThoai"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item
            name="matKhau"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Button type="link" size="small" onClick={() => navigate('/forgot-password')}>
              Quên mật khẩu?
            </Button>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={mutation.isPending}
            >
              Đăng nhập
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <Text>Chưa có tài khoản? </Text>
            <Button type="link" style={{ padding: 0 }} onClick={() => navigate('/register')}>
              Đăng ký ngay
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
