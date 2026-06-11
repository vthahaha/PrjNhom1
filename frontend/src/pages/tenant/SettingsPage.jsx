import { Card, Form, Input, Button, Typography, App, Spin, Tabs } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantApi, authApi } from '../../api'

const { Title } = Typography

export default function SettingsPage() {
  const [formInfo] = Form.useForm()
  const [formPassword] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  // -- Info Logic --
  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => tenantApi.getMe().then(r => r.data),
    onSuccess: (d) => formInfo.setFieldsValue(d),
  })

  const updateInfoMutation = useMutation({
    mutationFn: tenantApi.updateMe,
    onSuccess: () => { message.success('Cập nhật thông tin thành công'); qc.invalidateQueries({ queryKey: ['my-profile'] }) },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi cập nhật'),
  })

  // -- Password Logic --
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => { message.success('Đổi mật khẩu thành công'); formPassword.resetFields() },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi đổi mật khẩu'),
  })

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 80 }} />

  const items = [
    {
      key: 'info',
      label: 'Thông tin cá nhân',
      children: (
        <Form
          form={formInfo}
          layout="vertical"
          initialValues={data}
          onFinish={(v) => updateInfoMutation.mutate(v)}
          style={{ maxWidth: 400 }}
        >
          <Form.Item label="Họ tên" name="hoTen" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Số điện thoại" name="soDienThoai"><Input disabled /></Form.Item>
          <Form.Item label="Email" name="email"><Input /></Form.Item>
          <Form.Item label="CCCD" name="cccd"><Input /></Form.Item>
          <Form.Item label="Quê quán" name="queQuan"><Input /></Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updateInfoMutation.isPending}>Lưu thay đổi</Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      children: (
        <Form
          form={formPassword}
          layout="vertical"
          onFinish={(v) => changePasswordMutation.mutate(v)}
          style={{ maxWidth: 400 }}
        >
          <Form.Item label="Mật khẩu cũ" name="matKhauCu" rules={[{ required: true }]}><Input.Password /></Form.Item>
          <Form.Item label="Mật khẩu mới" name="matKhauMoi" rules={[{ required: true, min: 8, message: 'Tối thiểu 8 ký tự' }]}><Input.Password /></Form.Item>
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
            <Button type="primary" htmlType="submit" loading={changePasswordMutation.isPending}>Đổi mật khẩu</Button>
          </Form.Item>
        </Form>
      )
    }
  ]

  return (
    <div style={{ maxWidth: 800 }}>
      <Title level={4} style={{ marginBottom: 24 }}>Cài đặt tài khoản</Title>
      <Card>
        <Tabs defaultActiveKey="info" items={items} />
      </Card>
    </div>
  )
}
