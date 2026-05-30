import { useState } from 'react'
import { Table, Button, Tag, Typography, Modal, Form, Input, App, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { repairApi } from '../../api'

const { Title } = Typography

const trangThaiConfig = {
  CHO_XU_LY:  { color: 'orange', label: 'Chờ xử lý'  },
  DANG_XU_LY: { color: 'blue',   label: 'Đang xử lý' },
  HOAN_THANH: { color: 'green',  label: 'Hoàn thành'  },
}

export default function MyRepairRequestsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-repairs'],
    queryFn: () => repairApi.getMine().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: repairApi.create,
    onSuccess: () => {
      message.success('Đã gửi yêu cầu sửa chữa')
      setModalOpen(false); form.resetFields()
      qc.invalidateQueries({ queryKey: ['my-repairs'] })
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi gửi yêu cầu'),
  })

  const columns = [
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', key: 'ngayGui', render: v => dayjs(v).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: v => <Tag color={trangThaiConfig[v]?.color}>{trangThaiConfig[v]?.label}</Tag>,
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Yêu cầu sửa chữa</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Gửi yêu cầu</Button>
      </div>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />

      <Modal title="Gửi yêu cầu sửa chữa" open={modalOpen} onCancel={() => { setModalOpen(false); form.resetFields() }} footer={null} destroyOnHidden>
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)} style={{ marginTop: 16 }}>
          <Form.Item label="Mô tả sự cố" name="moTa" rules={[{ required: true, message: 'Vui lòng mô tả sự cố' }]}>
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết vấn đề cần sửa chữa..." />
          </Form.Item>
          <Form.Item label="Đường dẫn ảnh (tùy chọn)" name="anhUrl">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields() }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Gửi yêu cầu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
