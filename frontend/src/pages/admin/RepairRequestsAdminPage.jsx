import { Table, Button, Tag, Typography, Space, App, Modal, InputNumber, Image, Spin } from 'antd'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { repairApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title } = Typography

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
    { title: 'Khách thuê', dataIndex: 'hoTenKhach', key: 'hoTenKhach', ...getColumnSearchProps('hoTenKhach', 'khách thuê') },
    { title: 'Mô tả', dataIndex: 'moTa', key: 'moTa', ellipsis: true },
    {
      title: 'CSVC hỏng', dataIndex: 'csvcHieuHong', key: 'csvcHieuHong',
      render: v => v ? <Space size={[0, 4]} wrap>{v.split(', ').map(i => <Tag key={i} color="red">{i}</Tag>)}</Space> : '—'
    },
    { 
      title: 'Ảnh minh họa', 
      dataIndex: 'anhUrl', 
      key: 'anhUrl', 
      width: 120,
      align: 'center',
      render: v => v ? (
        <Image 
          src={v.startsWith('http') ? v : `/api/public/files/${v}`} 
          alt="Sự cố" 
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} 
          placeholder={<Spin size="small" />}
        />
      ) : '—' 
    },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', key: 'ngayGui', render: v => dayjs(v).format('DD/MM/YYYY HH:mm') },
    { title: 'Chi phí', dataIndex: 'chiPhi', key: 'chiPhi', render: v => v ? `${Number(v).toLocaleString('vi-VN')} đ` : '—' },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: v => <Tag color={trangThaiConfig[v]?.color}>{trangThaiConfig[v]?.label}</Tag>,
    },
    {
      title: 'Thao tác', key: 'action',
      width: 160,
      align: 'center',
      render: (_, r) => (
        <Space>
          {r.trangThai === 'CHO_XU_LY' && (
            <Button 
              type="primary" 
              size="small" 
              onClick={() => {
                setSelectedRequest(r);
                updateMutation.mutate({ id: r.id, trangThai: 'DANG_XU_LY' });
              }}
              loading={updateMutation.isPending && selectedRequest?.id === r.id}
            >
              Xử lý
            </Button>
          )}
          {r.trangThai === 'DANG_XU_LY' && (
            <Button 
              type="primary" 
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              size="small" 
              onClick={() => {
                setSelectedRequest(r);
                setRepairCost(r.chiPhi || 0);
                setCostModalOpen(true);
              }}
            >
              Hoàn thành
            </Button>
          )}
          {r.trangThai === 'HOAN_THANH' && (
            <span style={{ color: 'gray', fontSize: 12 }}>Đã hoàn tất</span>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Yêu cầu sửa chữa</Title>
      <Table 
        rowKey="id" 
        dataSource={data ?? []} 
        columns={columns} 
        loading={isLoading} 
        pagination={{ pageSize: 10 }} 
        scroll={{ x: 'max-content' }}
      />
      
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
