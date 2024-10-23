'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  Container,
  Group,
  Text,
  Button,
  Modal,
  List,
  Center,
  Grid,
  Popover
} from '@mantine/core';
import Timeline from './timeline';
import { getRooms } from '@/actions/rooms/action';
import { ITransaction } from '@/models/transaction';
import { getTransactionsGroupedByRoom } from '@/actions/transactions/action';

interface Room {
  roomId: string;
  name: string;
}

interface TransactionsByRoom {
  roomId: string;
  name: string;
  status: 'trắng' | 'vàng' | 'xanh';
  transactions: ITransaction[];
  totalAmount: number;
}

export default function DayDetails() {
  const router = useRouter();
  const dateTarget = useSearchParams().get('date');
  const dateFormat = dateTarget ? new Date(dateTarget) : new Date();

  const [selectedRoom, setSelectedRoom] = useState<TransactionsByRoom | null>(
    null
  );
  const [modalOpened, setModalOpened] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [transactionsByRoom, setTransactionsByRoom] = useState<any[]>([]);
  const [dataCombine, setDataCombine] = useState<TransactionsByRoom[]>([]);

  const handleRoomClick = (room: TransactionsByRoom) => {
    setSelectedRoom(room);
    setModalOpened(true);
  };

  useEffect(() => {
    (async () => {
      try {
        const rooms = await getRooms();
        setRooms(JSON.parse(rooms));
        const transactionsByRoom =
          await getTransactionsGroupedByRoom(dateFormat);
        setTransactionsByRoom(transactionsByRoom);
      } catch (error) {
        console.error('Lỗi getRooms or getTransactionsGroupedByRoom');
      }
    })();
  }, []);

  useEffect(() => {
    if (rooms && transactionsByRoom) {
      setDataCombine([]);
      rooms.forEach((room) => {
        const newItem = {
          roomId: room.roomId,
          name: room.name,
          status: 'xanh',
          transactions: transactionsByRoom.find(
            (item) => item._id === room.roomId
          )?.transactions,
          totalAmount: transactionsByRoom.find(
            (item) => item._id === room.roomId
          )?.totalAmount
        } as TransactionsByRoom;

        setDataCombine((oldArray) => [...oldArray, newItem]);
      });
    }
  }, [rooms, transactionsByRoom]);

  return (
    <Container size="lg" p="md">
      <Center>
        <Text size="xl" weight={700} align="center" mb="lg">
          Chi Tiết Ngày {format(dateFormat, 'dd/MM/yyyy')}
        </Text>
      </Center>

      <Group justify="center" mb="md">
        <Button onClick={() => router.push('/calendars')}>Quay lại Lịch</Button>
        <Popover width={200} position="top" withArrow shadow="md">
          <Popover.Target>
            <Button>Chú thích</Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size="sm">{`TimeLine:`}</Text>
            <Text size="sm">{`Màu trắng -> Còn trống`}</Text>
            <Text size="sm">{`Màu đỏ -> Đã booking`}</Text>
            <Text size="sm">{`Màu cam -> Còn trống nhưng không đủ giờ`}</Text>
          </Popover.Dropdown>
        </Popover>
      </Group>

      {/* Danh sách phòng */}
      {/* {dataCombine.length && ( */}
        <Grid gutter="md">
          {dataCombine?.map((data) => (
            <Grid.Col key={data.roomId} span={{ base: 12, md: 6 }}>
              <Card
                key={data.roomId}
                shadow="sm"
                padding="lg"
                style={{
                  backgroundColor:
                    data.status === 'trắng'
                      ? 'white'
                      : data.status === 'vàng'
                        ? '#FFE066'
                        : '#69DB7C',
                  cursor: 'pointer'
                }}
                // onClick={() => handleRoomClick(data)}
              >
                <Text size="lg" weight={600} mb="sm">
                  Phòng {data.name}
                </Text>
                <Timeline
                  bookings={data.transactions?.map((item) => {
                    return {
                      customerName: item.customerName,
                      customerPhone: item.customerPhone,
                      checkin: new Date(item.checkin),
                      checkout: new Date(item.checkout),
                      roomIds: item.roomIds,
                      amount: item.amount
                    } as ITransaction;
                  })}
                  date={dateFormat}
                />
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      {/* )} */}

      {/* Modal Chi Tiết Phòng */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={`Chi Tiết ${selectedRoom?.name}`}
      >
        {selectedRoom && (
          <>
            {/* <List spacing="sm">
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
            </List> */}
          </>
        )}
      </Modal>
    </Container>
  );
}
