import { useEffect } from 'react'
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
  })

  useEffect(() => {
    if (data) {
      formInfo.setFieldsValue(data)
    }
  }, [data, formInfo])

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
    },
    {
      key: 'landlord',
      label: 'Thông tin nhà trọ',
      children: (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              padding: 20,
              borderRadius: 12,
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #e1e8ed'
            }}>
              <Typography.Title level={5} style={{ marginTop: 0, color: '#1a365d', fontSize: 16 }}>👤 Chủ nhà trọ</Typography.Title>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 }}>Vũ Tuấn Hải</div>
              <div style={{ fontSize: 14, color: '#4a5568' }}>Số điện thoại: 0344421488</div>
              <div style={{ fontSize: 14, color: '#4a5568' }}>Tài khoản ngân hàng: MB Bank</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              padding: 20,
              borderRadius: 12,
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              border: '1px solid #bae6fd'
            }}>
              <Typography.Title level={5} style={{ marginTop: 0, color: '#0369a1', fontSize: 16 }}>📍 Địa chỉ nhà trọ</Typography.Title>
              <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.6 }}>
                Chung cư Trương Định Complex, ngõ 129D Trương Định, phường Tương Mai, thành phố Hà Nội
              </div>
            </div>
          </div>
          
          <div style={{ flex: '2 1 400px', minHeight: 300, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            <iframe
              title="Bản đồ nhà trọ"
              src="https://maps.google.com/maps?q=Chung%20c%C6%B0%20Tr%C6%B0%C6%A1ng%20%C4%90%E1%BB%8Bnh%20Complex,%20ng%C3%B5%20129D%20Tr%C6%B0%C6%A1ng%20%C4%90%E1%BB%8Bnh,%20ph%C6%B0%E1%BB%9Dng%20T%C6%B0%C6%A1ng%20Mai,%20H%C3%A0%20N%E1%BB%99i&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 320 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
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
