import { useState } from 'react'
import { Table, Button, Tag, Typography, Space, Modal, Form, Select, DatePicker, InputNumber, App } from 'antd'
import { PlusOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { contractApi, roomApi, tenantApi } from '../../api'

const { Title } = Typography
const { Option } = Select

const trangThaiConfig = {
  HIEU_LUC: { color: 'green',  label: 'Hiệu lực'  },
  HET_HAN:  { color: 'default',label: 'Hết hạn'   },
  CHAM_DUT: { color: 'red',    label: 'Chấm dứt'  },
}

export default function ContractsPage() {
  const [filter, setFilter] = useState(undefined)
  const [createModal, setCreateModal] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', filter],
    queryFn: () => contractApi.getAll(filter ? { trangThai: filter } : {}).then(r => r.data),
  })

  const { data: rooms } = useQuery({
    queryKey: ['rooms-select'],
    queryFn: () => roomApi.getAll({ trangThai: 'TRONG' }).then(r => r.data),
  })

  const { data: tenants } = useQuery({
    queryKey: ['tenants-select'],
    queryFn: () => tenantApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: contractApi.create,
    onSuccess: () => {
      message.success('Tạo hợp đồng thành công')
      setCreateModal(false); form.resetFields()
      qc.invalidateQueries({ queryKey: ['contracts'] })
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi tạo hợp đồng'),
  })

  const terminateMutation = useMutation({
    mutationFn: ({ id, data }) => contractApi.terminate(id, data),
    onSuccess: () => { message.success('Đã kết thúc hợp đồng'); qc.invalidateQueries({ queryKey: ['contracts'] }) },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi'),
  })

  const columns = [
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong' },
    { title: 'Khách thuê', dataIndex: 'hoTen', key: 'hoTen' },
    { title: 'Bắt đầu', dataIndex: 'ngayBatDau', key: 'ngayBatDau', render: v => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Kết thúc', dataIndex: 'ngayKetThuc', key: 'ngayKetThuc', render: v => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Giá thuê', dataIndex: 'giaThue', key: 'giaThue', render: v => `${Number(v).toLocaleString('vi-VN')} đ` },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: v => <Tag color={trangThaiConfig[v]?.color}>{trangThaiConfig[v]?.label}</Tag> },
    {
      title: 'Thao tác', key: 'action',
      render: (_, r) => r.trangThai === 'HIEU_LUC' && (
        <Button
          size="small" danger icon={<StopOutlined />}
          onClick={() => terminateMutation.mutate({ id: r.id, data: { lyDo: 'Admin kết thúc' } })}
        >
          Kết thúc
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý hợp đồng</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>Tạo hợp đồng</Button>
      </div>

      <Select placeholder="Lọc trạng thái" value={filter} onChange={setFilter} allowClear style={{ width: 180, marginBottom: 16 }}>
        <Option value="HIEU_LUC">Hiệu lực</Option>
        <Option value="HET_HAN">Hết hạn</Option>
        <Option value="CHAM_DUT">Chấm dứt</Option>
      </Select>

      <Table rowKey="id" dataSource={data ?? []} columns={columns} loading={isLoading} pagination={{ pageSize: 10 }} />

      <Modal title="Tạo hợp đồng mới" open={createModal} onCancel={() => setCreateModal(false)} footer={null} destroyOnHidden width={520}>
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate({ ...v, ngayBatDau: v.ngayBatDau?.format('YYYY-MM-DD'), ngayKetThuc: v.ngayKetThuc?.format('YYYY-MM-DD') })} style={{ marginTop: 16 }}>
          <Form.Item label="Phòng" name="phongId" rules={[{ required: true }]}>
            <Select placeholder="Chọn phòng còn trống" showSearch optionFilterProp="children">
              {rooms?.map(r => <Option key={r.id} value={r.id}>{r.tenPhong} — {Number(r.giaThue).toLocaleString('vi-VN')} đ</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Khách thuê" name="khachThueId" rules={[{ required: true }]}>
            <Select placeholder="Chọn khách thuê" showSearch optionFilterProp="children">
              {tenants?.map(t => <Option key={t.id} value={t.id}>{t.hoTen} — {t.soDienThoai}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Ngày bắt đầu" name="ngayBatDau" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
          <Form.Item label="Ngày kết thúc" name="ngayKetThuc" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
          <Form.Item label="Giá thuê (đ/tháng)" name="giaThue" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={100000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item label="Tiền cọc (đ)" name="tienCoc">
            <InputNumber style={{ width: '100%' }} min={0} step={100000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCreateModal(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo hợp đồng</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
