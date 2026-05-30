import { Card, Form, Input, Button, Typography, App, Spin } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantApi } from '../../api'

const { Title } = Typography

export default function MyProfilePage() {
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => tenantApi.getMe().then(r => r.data),
    onSuccess: (d) => form.setFieldsValue(d),
  })

  const updateMutation = useMutation({
    mutationFn: tenantApi.updateMe,
    onSuccess: () => { message.success('Cập nhật thông tin thành công'); qc.invalidateQueries({ queryKey: ['my-profile'] }) },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi cập nhật'),
  })

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 80 }} />

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={4}>Thông tin cá nhân</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={data}
          onFinish={(v) => updateMutation.mutate(v)}
        >
          <Form.Item label="Họ tên" name="hoTen" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="soDienThoai">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="CCCD" name="cccd">
            <Input />
          </Form.Item>
          <Form.Item label="Quê quán" name="queQuan">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
