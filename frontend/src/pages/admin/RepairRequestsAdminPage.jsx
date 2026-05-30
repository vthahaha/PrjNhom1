import { Table, Button, Tag, Typography, Select, Space, App } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { repairApi } from '../../api'

const { Title } = Typography
const { Option } = Select

const trangThaiConfig = {
  CHO_XU_LY:   { color: 'orange', label: 'Chờ xử lý'  },
  DANG_XU_LY:  { color: 'blue',   label: 'Đang xử lý' },
  HOAN_THANH:  { color: 'green',  label: 'Hoàn thành'  },
}

export default function RepairRequestsAdminPage() {
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['repair-requests'],
    queryFn: () => repairApi.getAll().then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, trangThai }) => repairApi.updateStatus(id, trangThai),
    onSuccess: () => { message.success('Đã cập nhật trạng thái'); qc.invalidateQueries({ queryKey: ['repair-requests'] }) },
    onError: () => message.error('Lỗi khi cập nhật'),
  })

  const columns = [
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong' },
    { title: 'Khách thuê', dataIndex: 'hoTen', key: 'hoTen' },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', key: 'ngayGui', render: v => dayjs(v).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: v => <Tag color={trangThaiConfig[v]?.color}>{trangThaiConfig[v]?.label}</Tag>,
    },
    {
      title: 'Cập nhật', key: 'action',
      render: (_, r) => (
        <Select
          value={r.trangThai}
          size="small"
          style={{ width: 140 }}
          onChange={(val) => updateMutation.mutate({ id: r.id, trangThai: val })}
        >
          <Option value="CHO_XU_LY">Chờ xử lý</Option>
          <Option value="DANG_XU_LY">Đang xử lý</Option>
          <Option value="HOAN_THANH">Hoàn thành</Option>
        </Select>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Yêu cầu sửa chữa</Title>
      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />
    </div>
  )
}
