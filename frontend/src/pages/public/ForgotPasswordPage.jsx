import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, App } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api'

const { Title, Text } = Typography

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()

  const mutation = useMutation({
    mutationFn: (email) => authApi.forgotPassword(email),
    onSuccess: () => {
      message.success('Link đặt lại mật khẩu đã được gửi đến email của bạn')
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    },
  })

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      <Card style={{ width: 380 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/login')}
          style={{ padding: 0, marginBottom: 16 }}
        >
          Quay lại đăng nhập
        </Button>

        <Title level={4}>Quên mật khẩu</Title>
        <Text type="secondary">Nhập email của bạn để nhận link đặt lại mật khẩu.</Text>

        <Form
          layout="vertical"
          onFinish={({ email }) => mutation.mutate(email)}
          style={{ marginTop: 24 }}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={mutation.isPending}>
              Gửi link đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
