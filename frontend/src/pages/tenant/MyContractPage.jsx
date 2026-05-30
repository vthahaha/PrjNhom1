import { Card, Descriptions, Tag, Typography, Spin, Empty } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { contractApi } from '../../api'

const { Title } = Typography

export default function MyContractPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-contract'],
    queryFn: () => contractApi.getMyContract().then(r => r.data),
  })

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 80 }} />
  if (!data) return <Empty description="Bạn chưa có hợp đồng nào" style={{ marginTop: 80 }} />

  const isExpiringSoon = dayjs(data.ngayKetThuc).diff(dayjs(), 'day') <= 30

  return (
    <div>
      <Title level={4}>Hợp đồng của tôi</Title>
      {isExpiringSoon && (
        <Card style={{ marginBottom: 16, background: '#fff7e6', border: '1px solid #ffd591' }}>
          ⚠️ Hợp đồng của bạn sẽ hết hạn trong <strong>{dayjs(data.ngayKetThuc).diff(dayjs(), 'day')} ngày</strong>. Vui lòng liên hệ chủ trọ để gia hạn.
        </Card>
      )}
      <Card>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Phòng">{data.tenPhong}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={data.trangThai === 'HIEU_LUC' ? 'green' : 'default'}>
              {data.trangThai === 'HIEU_LUC' ? 'Hiệu lực' : data.trangThai}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">{dayjs(data.ngayBatDau).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">{dayjs(data.ngayKetThuc).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Giá thuê">{Number(data.giaThue).toLocaleString('vi-VN')} đ/tháng</Descriptions.Item>
          <Descriptions.Item label="Tiền cọc">{Number(data.tienCoc).toLocaleString('vi-VN')} đ</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
