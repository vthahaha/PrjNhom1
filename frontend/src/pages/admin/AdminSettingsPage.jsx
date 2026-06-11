import { Card, Form, Input, Button, Typography, App } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api'

const { Title } = Typography

export default function AdminSettingsPage() {
  const [formPassword] = Form.useForm()
  const { message } = App.useApp()

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => { 
      message.success('Đổi mật khẩu thành công')
      formPassword.resetFields() 
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi đổi mật khẩu'),
  })

  return (
    <div style={{ maxWidth: 500 }}>
      <Title level={4} style={{ marginBottom: 24 }}>Cài đặt quản trị viên</Title>
      <Card title="Đổi mật khẩu">
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
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={changePasswordMutation.isPending}>
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
