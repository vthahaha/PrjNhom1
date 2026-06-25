import { useState } from 'react'
import { Card, Descriptions, Tag, Typography, Spin, Empty, Button, Modal, Form, Input, Table, App, DatePicker } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { contractApi } from '../../api'

const { Title, Text } = Typography

export default function MyContractPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-contract'],
    queryFn: () => contractApi.getMyContract().then(r => r.data),
  })

  const { data: extensions, isLoading: isExtLoading } = useQuery({
    queryKey: ['my-extension-requests'],
    queryFn: () => contractApi.getMyExtensionRequests().then(r => r.data),
    enabled: !!data,
  })

  const createRequestMutation = useMutation({
    mutationFn: contractApi.createExtensionRequest,
    onSuccess: () => {
      message.success('Gửi yêu cầu gia hạn thành công')
      setIsModalOpen(false)
      form.resetFields()
      qc.invalidateQueries({ queryKey: ['my-extension-requests'] })
    },
    onError: (e) => {
      message.error(e.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 80 }} />
  if (!data) return <Empty description="Bạn chưa có hợp đồng nào" style={{ marginTop: 80 }} />

  const isExpiringSoon = dayjs(data.ngayKetThuc).diff(dayjs(), 'day') <= 30

  const columns = [
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Ngày kết thúc mới',
      dataIndex: 'ngayKetThucMoi',
      key: 'ngayKetThucMoi',
      render: (val) => val ? <strong>{dayjs(val).format('DD/MM/YYYY')}</strong> : '—'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (status) => {
        let color = 'gold'
        let text = 'Chờ duyệt'
        if (status === 'APPROVED') {
          color = 'green'
          text = 'Đã duyệt'
        } else if (status === 'REJECTED') {
          color = 'red'
          text = 'Từ chối'
        }
        return <Tag color={color}>{text}</Tag>
      }
    }
  ]

  const totalDays = dayjs(data.ngayKetThuc).diff(dayjs(data.ngayBatDau), 'day')
  const spentDays = Math.max(0, dayjs().diff(dayjs(data.ngayBatDau), 'day'))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Hợp đồng của tôi</Title>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Yêu cầu gia hạn hợp đồng
        </Button>
      </div>

      {isExpiringSoon && (
        <Card style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 12 }}>
          ⚠️ Hợp đồng của bạn sẽ hết hạn trong <strong>{dayjs(data.ngayKetThuc).diff(dayjs(), 'day')} ngày</strong>. Bạn có thể gửi yêu cầu gia hạn ở trên.
        </Card>
      )}

      <Card title="Chi tiết hợp đồng" style={{ borderRadius: 12 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Phòng">{data.tenPhong}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={data.trangThai === 'HIEU_LUC' ? 'green' : 'default'}>
              {data.trangThai === 'HIEU_LUC' ? 'Hiệu lực' : data.trangThai}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">{dayjs(data.ngayBatDau).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">{dayjs(data.ngayKetThuc).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Thời gian thuê" span={2}>
            <strong>{totalDays} ngày</strong> (Đã ở: <strong>{spentDays} ngày</strong>)
          </Descriptions.Item>
          <Descriptions.Item label="Giá thuê">{Number(data.giaThue).toLocaleString('vi-VN')} đ/tháng</Descriptions.Item>
          <Descriptions.Item label="Tiền cọc">{Number(data.tienCoc).toLocaleString('vi-VN')} đ</Descriptions.Item>
          <Descriptions.Item label="Kỳ đóng tiền">
            {data.kyDongTien ? <Text strong>{data.kyDongTien} tháng / lần</Text> : <span style={{ color: 'gray' }}>Chưa có</span>}
          </Descriptions.Item>
          <Descriptions.Item label="File hợp đồng">
            {data.fileHopDongUrl ? (
              <a href={data.fileHopDongUrl} target="_blank" rel="noopener noreferrer">Xem / Tải về bản cứng</a>
            ) : (
              <span style={{ color: 'gray' }}>Chưa có file</span>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Lịch sử yêu cầu gia hạn" style={{ borderRadius: 12 }}>
        <Table
          dataSource={extensions || []}
          columns={columns}
          rowKey="id"
          loading={isExtLoading}
          pagination={false}
          locale={{ emptyText: 'Chưa gửi yêu cầu gia hạn nào' }}
        />
      </Card>

      <Modal
        title="Yêu cầu gia hạn hợp đồng"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createRequestMutation.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => {
            const payload = {
              ...v,
              ngayKetThucMoi: v.ngayKetThucMoi.format('YYYY-MM-DD')
            }
            createRequestMutation.mutate(payload)
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Ngày kết thúc gia hạn mới"
            name="ngayKetThucMoi"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc gia hạn mới!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                // Ràng buộc phải sau ngày kết thúc hiện tại
                return current && current.isBefore(dayjs(data.ngayKetThuc).endOf('day'))
              }}
            />
          </Form.Item>
          <Form.Item
            label="Ghi chú / Tin nhắn gửi chủ nhà"
            name="ghiChu"
          >
            <Input.TextArea rows={3} placeholder="Ví dụ: Tôi muốn gia hạn thêm đến ngày..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
