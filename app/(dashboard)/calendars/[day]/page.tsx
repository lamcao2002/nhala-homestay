'use client';

import { useParams, useRouter } from 'next/navigation';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  Container,
  Group,
  Text,
  Button,
  Modal,
  Badge,
  List,
  Center,
  Grid
} from '@mantine/core';

// Kiểu dữ liệu cho phòng và khách
interface CustomerInfo {
  name: string;
  phoneNumber: string;
  checkin: string;
  checkout: string;
}

interface RoomInfo {
  id: number;
  name: string;
  status: 'trắng' | 'vàng' | 'xanh';
  customers: CustomerInfo[];
}

// Dữ liệu giả cho danh sách phòng
const fakeRooms: RoomInfo[] = Array.from(
  { length: 5 },
  (_, i) =>
    ({
      id: i + 1,
      name: `Phòng ${i + 1}`,
      status: ['trắng', 'vàng', 'xanh'][Math.floor(Math.random() * 3)],
      customers: [
        {
          name: 'Nguyễn Văn A',
          phoneNumber: '0123456789',
          checkin: '12:00',
          checkout: '15:00'
        }
      ]
    }) as RoomInfo
);

export default function DayDetails() {
  const router = useRouter();
  const params = useParams();
  const day = params.day;

  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const handleRoomClick = (room: RoomInfo) => {
    setSelectedRoom(room);
    setModalOpened(true);
  };

  return (
    <Container size="lg" p="md">
      <Center>
        <Text size="xl" weight={700} align="center" mb="lg">
          Chi Tiết Ngày {format(new Date(), 'dd/MM/yyyy')}
        </Text>
      </Center>

      <Group justify="center" mb="md">
        <Button onClick={() => router.push('/calendars')}>Quay lại Lịch</Button>
      </Group>

      {/* Danh sách phòng */}
      <Grid gutter="md">
        {fakeRooms.map((room) => (
          <Grid.Col key={room.id} span={{ base: 12, md: 6 }}>
            <Card
              key={room.id}
              shadow="sm"
              padding="lg"
              style={{
                backgroundColor:
                  room.status === 'trắng'
                    ? 'white'
                    : room.status === 'vàng'
                      ? '#FFE066'
                      : '#69DB7C',
                cursor: 'pointer'
              }}
              onClick={() => handleRoomClick(room)}
            >
              <Text size="lg" weight={600} mb="sm">
                {room.name}
              </Text>
              <Badge color={room.status === 'xanh' ? 'green' : 'yellow'}>
                {room.status === 'trắng'
                  ? 'Phòng trống'
                  : room.status === 'vàng'
                    ? 'Thuê theo giờ'
                    : 'Đã đầy'}
              </Badge>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Modal Chi Tiết Phòng */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={`Chi Tiết ${selectedRoom?.name}`}
      >
        {selectedRoom && (
          <>
            <List spacing="sm">
              {selectedRoom.customers.map((customer, index) => (
                <List.Item key={index}>
                  <Text>
                    <strong>Tên:</strong> {customer.name}
                  </Text>
                  <Text>
                    <strong>SĐT:</strong> {customer.phoneNumber}
                  </Text>
                  <Text>
                    <strong>Check-in:</strong> {customer.checkin}
                  </Text>
                  <Text>
                    <strong>Check-out:</strong> {customer.checkout}
                  </Text>
                </List.Item>
              ))}
            </List>
          </>
        )}
      </Modal>
    </Container>
  );
}
