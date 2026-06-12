import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, App } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api'

const { Title, Text } = Typography

export default function RegisterPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      navigate('/login')
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Lỗi khi đăng ký tài khoản')
    },
  })

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f0f2f5', padding: '24px'
    }}>
      <Card style={{ width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>🏠 MyRoom</Title>
          <Text type="secondary">Đăng ký tài khoản mới</Text>
        </div>

        <Form layout="vertical" onFinish={(values) => mutation.mutate(values)} size="large">
          <Form.Item
            name="hoTen"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item
            name="soDienThoai"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email (tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="matKhau"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          
          <Form.Item
            name="xacNhanMatKhau"
            dependencies={['matKhau']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('matKhau') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={mutation.isPending}
            >
              Đăng ký
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <Text>Đã có tài khoản? </Text>
            <Button type="link" style={{ padding: 0 }} onClick={() => navigate('/login')}>
              Đăng nhập ngay
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}
