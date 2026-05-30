import { Row, Col, Card, Tag, Typography, Spin } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../../api'

const { Title, Text } = Typography

export default function PublicRoomsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['public-rooms'],
    queryFn: () => publicApi.getRooms().then(r => r.data),
  })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <Title level={2}><HomeOutlined /> Phòng trọ còn trống</Title>
      {isLoading ? (
        <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 64 }} />
      ) : (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {data?.map(room => (
            <Col xs={24} sm={12} md={8} key={room.id}>
              <Card hoverable>
                <Title level={5}>{room.tenPhong}</Title>
                <Text>Diện tích: {room.dienTich} m²</Text><br />
                <Text>Giá thuê: {room.giaThue?.toLocaleString('vi-VN')} đ/tháng</Text><br />
                <Text type="secondary">Tối đa: {room.soNguoiToiDa} người</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color="green">Còn trống</Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
