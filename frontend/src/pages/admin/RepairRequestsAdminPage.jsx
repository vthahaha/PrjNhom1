import { Table, Button, Tag, Typography, Select, Space, App, Modal, InputNumber } from 'antd'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { repairApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

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

  const [costModalOpen, setCostModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [repairCost, setRepairCost] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['repair-requests'],
    queryFn: () => repairApi.getAll().then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, trangThai, chiPhi }) => repairApi.update(id, { trangThai, chiPhi }),
    onSuccess: () => { 
      message.success('Đã cập nhật yêu cầu'); 
      qc.invalidateQueries({ queryKey: ['repair-requests'] });
      setCostModalOpen(false);
    },
    onError: () => message.error('Lỗi khi cập nhật'),
  })

  const columns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong', ...getColumnSearchProps('tenPhong', 'tên phòng') },
    { title: 'Khách thuê', dataIndex: 'hoTen', key: 'hoTen', ...getColumnSearchProps('hoTen', 'khách thuê') },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    {
      title: 'CSVC hỏng', dataIndex: 'csvcHieuHong', key: 'csvcHieuHong',
      render: v => v ? <Space size={[0, 4]} wrap>{v.split(', ').map(i => <Tag key={i} color="red">{i}</Tag>)}</Space> : '—'
    },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', key: 'ngayGui', render: v => dayjs(v).format('DD/MM/YYYY HH:mm') },
    { title: 'Chi phí', dataIndex: 'chiPhi', key: 'chiPhi', render: v => v ? `${Number(v).toLocaleString('vi-VN')} đ` : '—' },
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
          onChange={(val) => {
            if (val === 'HOAN_THANH') {
              setSelectedRequest(r);
              setRepairCost(r.chiPhi || 0);
              setCostModalOpen(true);
            } else {
              updateMutation.mutate({ id: r.id, trangThai: val })
            }
          }}
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
      
      <Modal
        title="Xác nhận hoàn thành & Nhập chi phí"
        open={costModalOpen}
        onOk={() => updateMutation.mutate({ id: selectedRequest?.id, trangThai: 'HOAN_THANH', chiPhi: repairCost })}
        onCancel={() => setCostModalOpen(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={updateMutation.isPending}
      >
        <div style={{ marginBottom: 8 }}>Vui lòng nhập chi phí sửa chữa (nếu có):</div>
        <InputNumber 
          style={{ width: '100%' }} 
          min={0} 
          step={10000} 
          value={repairCost} 
          onChange={setRepairCost}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
        />
      </Modal>
    </div>
  )
}
