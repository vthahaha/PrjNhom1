import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Alert, App } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api'
import { useAuth } from '../../store/AuthContext'

const { Title, Text } = Typography

export default function FirstLoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const { message } = App.useApp()

  const mutation = useMutation({
    mutationFn: (newPassword) => authApi.firstLoginChange(newPassword),
    onSuccess: () => {
      // Update local user state: doiMkLanDau = false
      login({ ...user, doiMkLanDau: false })
      message.success('Đổi mật khẩu thành công!')
      if (user?.vaiTro === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/tenant/hop-dong')
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    },
  })

  const onFinish = ({ matKhauMoi, xacNhan }) => {
    if (matKhauMoi !== xacNhan) {
      message.error('Xác nhận mật khẩu không khớp')
      return
    }
    mutation.mutate(matKhauMoi)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f0f2f5',
    }}>
      <Card style={{ width: 420 }}>
        <Title level={4}>Đổi mật khẩu lần đầu</Title>
        <Alert
          type="warning"
          message="Bạn cần đổi mật khẩu trước khi sử dụng hệ thống."
          style={{ marginBottom: 24 }}
          showIcon
        />

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            label="Mật khẩu mới"
            name="matKhauMoi"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 8 ký tự" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="xacNhan"
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={mutation.isPending}>
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
