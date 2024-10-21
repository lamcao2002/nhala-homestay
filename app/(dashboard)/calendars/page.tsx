'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { addDays, subDays, format, startOfToday } from 'date-fns';
import {
  Button,
  Grid,
  Card,
  Text,
  Group,
  Container,
  Center,
  Modal,
  TextInput,
  NumberInput
} from '@mantine/core';

import { DateTimePicker } from '@mantine/dates';

interface Transaction {
  roomId: number;
  checkin: Date;
  checkout: Date;
}

// const transactions: Transaction[] = [
//   {
//     roomId: 1,
//     checkin: new Date('2024-10-19T08:00:00'),
//     checkout: new Date('2024-10-19T12:00:00')
//   },
//   {
//     roomId: 1,
//     checkin: new Date('2024-10-19T13:00:00'),
//     checkout: new Date('2024-10-19T23:00:00')
//   },
//   {
//     roomId: 1,
//     checkin: new Date('2024-10-19T01:00:00'),
//     checkout: new Date('2024-10-19T07:00:00')
//   }
// ];

// interface Room {
//   id: number;
//   name: string;
// }

// const rooms: Room[] = [
//   { id: 1, name: 'Phòng 1' },
//   { id: 2, name: 'Phòng 2' },
//   { id: 3, name: 'Phòng 3' }
// ];

// function isRoomAvailableAllDay(
//   roomId: number,
//   date: Date,
//   transactions: Transaction[]
// ): boolean {
//   const start = new Date(date);
//   start.setHours(14, 0, 0, 0); // 14:00 hôm nay

//   const end = new Date(date);
//   end.setDate(end.getDate() + 1);
//   end.setHours(12, 0, 0, 0); // 12:00 ngày hôm sau

//   // Kiểm tra nếu có bất kỳ giao dịch nào trong khoảng từ 14:00 - 12:00
//   return !transactions.some(
//     (transaction) =>
//       transaction.roomId === roomId &&
//       ((transaction.checkin >= start && transaction.checkin < end) || // Check-in trong khoảng thời gian này
//         (transaction.checkout > start && transaction.checkout <= end) || // Check-out trong khoảng thời gian này
//         (transaction.checkin < start && transaction.checkout > end)) // Giao dịch bao trùm khoảng thời gian này
//   );
// }
// function isRoomAvailableByHour(
//   roomId: number,
//   date: Date,
//   transactions: Transaction[]
// ): boolean {
//   const startOfDay = new Date(date);
//   startOfDay.setHours(0, 0, 0, 0); // 00:00 hôm nay

//   const endOfDay = new Date(date);
//   endOfDay.setHours(23, 59, 59, 999); // 23:59 hôm nay

//   // Lấy các giao dịch trong ngày
//   const roomTransactions = transactions.filter(
//     (transaction) =>
//       transaction.roomId === roomId &&
//       transaction.checkin >= startOfDay &&
//       transaction.checkout <= endOfDay
//   );

//   // Sắp xếp các giao dịch theo thời gian check-in
//   roomTransactions.sort((a, b) => a.checkin.getTime() - b.checkin.getTime());

//   // Kiểm tra nếu có khoảng trống >= 3 giờ giữa các giao dịch
//   let previousCheckout = startOfDay;

//   for (const transaction of roomTransactions) {
//     const gapInHours =
//       (transaction.checkin.getTime() - previousCheckout.getTime()) /
//       (1000 * 60 * 60);

//     if (gapInHours >= 3) {
//       return true; // Có ít nhất 3 giờ trống giữa các giao dịch
//     }

//     previousCheckout = transaction.checkout;
//   }

//   // Kiểm tra khoảng trống từ giao dịch cuối cùng đến hết ngày
//   const finalGapInHours =
//     (endOfDay.getTime() - previousCheckout.getTime()) / (1000 * 60 * 60);

//   return finalGapInHours >= 3;
// }

// const today = new Date('2024-10-19');

// rooms.forEach((room) => {
//   const availableAllDay = isRoomAvailableAllDay(room.id, today, transactions);
//   const availableByHour = !availableAllDay && isRoomAvailableByHour(room.id, today, transactions);

//   console.log(
//     `${room.name}: Trống cả ngày - ${availableAllDay}, Trống theo giờ - ${availableByHour}`
//   );

// });

// Kiểu dữ liệu phòng
interface Room {
  id: number;
  name: string;
}

// Giả sử danh sách phòng đã được cung cấp
const rooms: Room[] = [
  { id: 1, name: 'Phòng 1' },
  { id: 2, name: 'Phòng 2' },
  { id: 3, name: 'Phòng 3' }
];

// Kiểu dữ liệu cho ngày
interface DayInfo {
  date: Date;
  status: 'trắng' | 'vàng' | 'xanh';
  revenue: number;
  roomsAvailable: number;
  hourlyRoomsAvailable: number;
}

// Tạo dữ liệu giả cho 30 ngày
const generateFakeData = (startDate: Date): DayInfo[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      status: ['trắng', 'vàng', 'xanh'][Math.floor(Math.random() * 3)],
      revenue: Math.floor(Math.random() * 5000) + 1000,
      roomsAvailable: Math.floor(Math.random() * 5),
      hourlyRoomsAvailable: Math.floor(Math.random() * 3)
    } as DayInfo;
  });
};

export default function Calendar() {
  const router = useRouter();

  const [startDate, setStartDate] = useState(startOfToday());
  const [days, setDays] = useState<DayInfo[]>([]);

  const [modalOpened, setModalOpened] = useState(false); // Quản lý trạng thái modal
  const [newTransaction, setNewTransaction] = useState({
    roomId: 1,
    checkin: '',
    checkout: '',
    amount: 0
  });

  useEffect(() => {
    setDays(generateFakeData(startDate));
  }, [startDate]);

  const handlePrev = () => {
    setStartDate((prev) => subDays(prev, 30));
  };

  const handleNext = () => {
    setStartDate((prev) => addDays(prev, 30));
  };

  const handleToday = () => {
    setStartDate(startOfToday());
  };

  const handleInputChange = (
    e: any
  ) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };
  const handleAmountChange = (value: number) =>
    setNewTransaction((prev) => ({ ...prev, amount: value }));

  const handleSubmit = () => {
    console.log('Giao dịch mới:', newTransaction);
    setModalOpened(false); // Đóng modal sau khi gửi form
  };

  return (
    <Container size="lg" p="md">
      <Center>
        <Text size="xl" weight={700} align="center" mb="lg">
          Lịch 30 Ngày
        </Text>
      </Center>

      {/* Nút Today */}
      <Center>
        <Button onClick={handleToday} color="blue">
          Today
        </Button>
      </Center>

      {/* Nút mũi tên trái/phải */}
      <Button
        onClick={handlePrev}
        variant="light"
        radius="xl"
        size="lg"
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        ⬅️
      </Button>
      <Button
        onClick={handleNext}
        variant="light"
        radius="xl"
        size="lg"
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        ➡️
      </Button>

      {/* Grid Responsive: 3 cột trên mobile, 5 cột trên desktop */}
      <Grid gutter="md">
        {days.map(
          ({ date, status, revenue, roomsAvailable, hourlyRoomsAvailable }) => (
            <Grid.Col key={date.toISOString()} span={{ base: 6, md: 2 }}>
              <Card
                shadow="sm"
                padding="lg"
                style={{
                  backgroundColor:
                    status === 'trắng'
                      ? 'white'
                      : status === 'vàng'
                        ? '#FFE066'
                        : '#69DB7C'
                }}
                onClick={() => router.push(`/calendars/${date.getDay()}`)}
              >
                <Text size="lg" weight={600}>
                  {format(date, 'dd/MM/yyyy')}
                </Text>
                <Text size="sm" mt="xs">
                  Phòng trống: {roomsAvailable}
                </Text>
                <Text size="sm">Phòng theo giờ: {hourlyRoomsAvailable}</Text>
                <Text size="sm" weight={500} mt="sm">
                  Doanh thu: {revenue.toLocaleString()} VND
                </Text>
              </Card>
            </Grid.Col>
          )
        )}
      </Grid>

      {/* Nút thêm giao dịch sticky ở góc phải */}
      <Button
        onClick={() => setModalOpened(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}
      >
        Thêm Giao Dịch
      </Button>

      {/* Modal Form thêm giao dịch */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Tạo Giao Dịch Mới"
        fullScreen
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <DateTimePicker
            clearable
            defaultValue={new Date()}
            label="Check-in"
            placeholder="Check-in"
            name="checkin"
            // onChange={handleInputChange}
            dropdownType="modal"
            required
          />
          <DateTimePicker
            clearable
            defaultValue={new Date()}
            label="Check-out"
            placeholder="Check-out"
            name="checkout"
            // onChange={handleInputChange}
            dropdownType="modal"
            required
          />
          <NumberInput
            label="Số tiền"
            value={newTransaction.amount}
            // onChange={handleAmountChange}
            thousandSeparator=","
            required
          />
          <select
            name="roomId"
            value={newTransaction.roomId}
            onChange={handleInputChange}
            style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          <Group justify="right" mt="md">
            <Button type="submit">Tạo Giao Dịch</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
