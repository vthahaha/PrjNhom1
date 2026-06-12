import { useState } from 'react'
import { Table, Button, Tag, Typography, Space, Modal, Form, Select, DatePicker, InputNumber, App, Upload, Checkbox, Divider, Spin } from 'antd'
import { PlusOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { contractApi, roomApi, tenantApi, serviceApi } from '../../api'
import { getColumnSearchProps } from '../../utils/tableUtils'

const { Title, Text } = Typography
const { Option } = Select

const trangThaiConfig = {
  HIEU_LUC: { color: 'green',  label: 'Hiệu lực'  },
  HET_HAN:  { color: 'default',label: 'Hết hạn'   },
  CHAM_DUT: { color: 'red',    label: 'Chấm dứt'  },
}

export default function ContractsPage() {
  const [filter, setFilter] = useState(undefined)
  const [createModal, setCreateModal] = useState(false)
  const [selectedPhongId, setSelectedPhongId] = useState(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', filter],
    queryFn: () => contractApi.getAll(filter ? { trangThai: filter } : {}).then(r => r.data),
  })

  const { data: rooms } = useQuery({
    queryKey: ['rooms-select'],
    queryFn: () => roomApi.getAll({ availableForContract: true }).then(r => r.data),
  })

  const { data: tenants } = useQuery({
    queryKey: ['tenants-select'],
    queryFn: () => tenantApi.getAll().then(r => r.data),
  })

  // Lấy danh sách dịch vụ của phòng được chọn
  const { data: roomServices, isFetching: loadingServices } = useQuery({
    queryKey: ['room-services', selectedPhongId],
    queryFn: () => roomApi.getServices(selectedPhongId).then(r => r.data),
    enabled: !!selectedPhongId,
  })

  const createMutation = useMutation({
    mutationFn: contractApi.create,
    onSuccess: () => {
      message.success('Tạo hợp đồng thành công')
      setCreateModal(false)
      setSelectedPhongId(null)
      form.resetFields()
      qc.invalidateQueries({ queryKey: ['contracts'] })
      qc.invalidateQueries({ queryKey: ['rooms-select'] })
    },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi tạo hợp đồng'),
  })

  const terminateMutation = useMutation({
    mutationFn: ({ id, data }) => contractApi.terminate(id, data),
    onSuccess: () => { message.success('Đã kết thúc hợp đồng'); qc.invalidateQueries({ queryKey: ['contracts'] }) },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi'),
  })

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }) => {
      const formData = new FormData()
      formData.append('file', file)
      return contractApi.uploadDocument(id, formData)
    },
    onSuccess: () => { message.success('Tải file lên thành công'); qc.invalidateQueries({ queryKey: ['contracts'] }) },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi tải file'),
  })

  const deleteDocumentMutation = useMutation({
    mutationFn: (id) => contractApi.deleteDocument(id),
    onSuccess: () => { message.success('Xóa file thành công'); qc.invalidateQueries({ queryKey: ['contracts'] }) },
    onError: (e) => message.error(e.response?.data?.message || 'Lỗi khi xóa file'),
  })

  const handleRoomChange = (phongId) => {
    setSelectedPhongId(phongId)
    form.setFieldValue('dichVuIds', []) // reset dịch vụ khi đổi phòng
  }

  const handleSubmit = (v) => {
    createMutation.mutate({
      ...v,
      ngayBatDau: v.ngayBatDau?.format('YYYY-MM-DD'),
      ngayKetThuc: v.ngayKetThuc?.format('YYYY-MM-DD'),
      dichVuIds: v.dichVuIds ?? [],
    })
  }

  const handleCloseModal = () => {
    setCreateModal(false)
    setSelectedPhongId(null)
    form.resetFields()
  }

  const columns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Phòng', dataIndex: 'tenPhong', key: 'tenPhong', ...getColumnSearchProps('tenPhong', 'tên phòng') },
    { title: 'Khách thuê', dataIndex: 'hoTenKhach', key: 'hoTenKhach', ...getColumnSearchProps('hoTenKhach', 'khách thuê') },
    { title: 'Bắt đầu', dataIndex: 'ngayBatDau', key: 'ngayBatDau', render: v => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Kết thúc', dataIndex: 'ngayKetThuc', key: 'ngayKetThuc', render: v => dayjs(v).format('DD/MM/YYYY') },
    { title: 'Giá thuê', dataIndex: 'giaThue', key: 'giaThue', render: v => `${Number(v).toLocaleString('vi-VN')} đ` },
    {
      title: 'Dịch vụ', key: 'dichVu',
      render: (_, r) => r.dichVu?.length > 0
        ? <Space size={[0, 4]} wrap>{r.dichVu.map(dv => <Tag key={dv.id} color="purple">{dv.tenDichVu}</Tag>)}</Space>
        : <Text type="secondary">—</Text>
    },
    { title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: v => <Tag color={trangThaiConfig[v]?.color}>{trangThaiConfig[v]?.label}</Tag> },
    {
      title: 'File Hợp đồng', key: 'fileHopDong',
      render: (_, r) => r.fileHopDongUrl ? (
        <Space size={0} split={<span style={{color: '#ccc'}}>|</span>}>
          <Button type="link" href={r.fileHopDongUrl} target="_blank">Xem / Tải về</Button>
          <Button type="link" danger onClick={() => Modal.confirm({ title: 'Xóa file hợp đồng?', onOk: () => deleteDocumentMutation.mutate(r.id) })} loading={deleteDocumentMutation.isPending}>Xóa</Button>
        </Space>
      ) : (
        <Upload showUploadList={false} beforeUpload={(file) => { uploadMutation.mutate({ id: r.id, file }); return false; }} accept=".pdf,.docx,.png,.jpg,.jpeg">
          <Button size="small" icon={<UploadOutlined />} loading={uploadMutation.isPending}>Tải lên</Button>
        </Upload>
      )
    },
    {
      title: 'Thao tác', key: 'action',
      render: (_, r) => r.trangThai === 'HIEU_LUC' && (
        <Button
          size="small" danger icon={<StopOutlined />}
          onClick={() => terminateMutation.mutate({ 
            id: r.id, 
            data: { 
              lyDoChamDut: 'Admin kết thúc',
              ngayTraPhong: dayjs().format('YYYY-MM-DD')
            } 
          })}
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

      <Modal title="Tạo hợp đồng mới" open={createModal} onCancel={handleCloseModal} footer={null} destroyOnHidden width={560}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item label="Phòng" name="phongId" rules={[{ required: true }]}>
            <Select 
              placeholder="Chọn phòng còn chỗ trống" 
              showSearch 
              optionFilterProp="children"
              onChange={handleRoomChange}
            >
              {rooms?.map(r => (
                <Option key={r.id} value={r.id}>
                  {r.tenPhong} (Đang ở: {r.soNguoiDaO || 0}/{r.soNguoiToiDa || 2} người) — {Number(r.giaThue).toLocaleString('vi-VN')} đ
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Khách thuê" name="khachThueId" rules={[{ required: true }]}>
            <Select placeholder="Chọn khách thuê" showSearch optionFilterProp="children">
              {tenants?.map(t => <Option key={t.id} value={t.id}>{t.hoTen} — {t.soDienThoai}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item label="Ngày bắt đầu" name="ngayBatDau" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Ngày kết thúc" name="ngayKetThuc" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Giá thuê (đ/tháng)" name="giaThue" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={100000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item label="Tiền cọc (đ)" name="tienCoc">
            <InputNumber style={{ width: '100%' }} min={0} step={100000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item label="Số người ở" name="soNguoiO" initialValue={1} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          {/* Dịch vụ kèm theo */}
          {selectedPhongId && (
            <>
              <Divider orientation="left" style={{ fontSize: 13 }}>Dịch vụ kèm theo</Divider>
              {loadingServices ? (
                <Spin size="small" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }} />
              ) : (
                <Form.Item name="dichVuIds">
                  <Checkbox.Group style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {roomServices?.map(rs => (
                        <Checkbox key={rs.dichVuId} value={rs.dichVuId}>
                          <span>{rs.tenDichVu}</span>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            {Number(rs.donGiaApDung).toLocaleString('vi-VN')} đ/{rs.donVi?.replace('đ/', '') ?? 'tháng'}
                          </Text>
                        </Checkbox>
                      ))}
                      {(!roomServices || roomServices.length === 0) && (
                        <Text type="secondary">Phòng này chưa có dịch vụ nào được gán.</Text>
                      )}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>
              )}
            </>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCloseModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo hợp đồng</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
