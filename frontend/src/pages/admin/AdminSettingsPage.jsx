import { Card, Form, Input, Button, Typography, App, Row, Col } from 'antd'
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
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>Cài đặt hệ thống</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card title="Đổi mật khẩu" style={{ height: '100%' }} styles={{ body: { padding: 24 } }}>
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
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={changePasswordMutation.isPending} block>
                  Cập nhật mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} md={14}>
          <Card title="Thông tin nhà trọ & Địa chỉ" style={{ height: '100%' }}>
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
          </Card>
        </Col>
      </Row>
    </div>
  )
}
