import { useState } from 'react'
import { Table, Button, Tag, Typography, Modal, Form, Input, App, Space, Checkbox } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { repairApi, contractApi } from '../../api'

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

  const { data: myContract } = useQuery({
    queryKey: ['my-contract'],
    queryFn: () => contractApi.getMyContract().then(r => r.data),
    retry: false
  })

  const roomFacilities = myContract?.tienNghi ? myContract.tienNghi.split(', ') : []

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
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    {
      title: 'CSVC hỏng', dataIndex: 'csvcHieuHong', key: 'csvcHieuHong',
      render: v => v ? <Space size={[0, 4]} wrap>{v.split(', ').map(i => <Tag key={i} color="red">{i}</Tag>)}</Space> : '—'
    },
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
          {roomFacilities.length > 0 && (
            <Form.Item label="Chọn Cơ sở vật chất hỏng" name="csvcHieuHong">
              <Checkbox.Group options={roomFacilities} />
            </Form.Item>
          )}
          <Form.Item 
            label="Mô tả sự cố" 
            name="moTa"
            dependencies={['csvcHieuHong']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const csvc = getFieldValue('csvcHieuHong')
                  if (!value && (!csvc || csvc.length === 0)) {
                    return Promise.reject(new Error('Vui lòng chọn cơ sở vật chất hoặc nhập mô tả'))
                  }
                  return Promise.resolve()
                }
              })
            ]}
          >
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
