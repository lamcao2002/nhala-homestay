'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { addDays, subDays, format, startOfToday, isSameDay } from 'date-fns';
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
  NumberInput,
  MultiSelect,
  Badge,
  ActionIcon
} from '@mantine/core';

import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  createTransaction,
  getRevenueByDayForRange,
  getTransactionsEachRoom
} from '@/actions/transactions/action';
import { MoveLeft, MoveRight, Plus } from 'lucide-react';
import { getRooms } from '@/actions/rooms/action';
import { isRoomAvailableAllDay, isRoomAvailableByHour } from '@/utils/utils';

// Kiểu dữ liệu phòng
interface Room {
  roomId: string;
  name: string;
}

// Kiểu dữ liệu cho ngày
interface DayInfo {
  date: Date;
  status: 'allDay' | 'byHour' | 'full';
  revenue: number;
  roomsAvailable: string[];
  hourlyRoomsAvailable: string[];
}

// Tạo dữ liệu giả cho 30 ngày
const generateFakeData = async (
  startDate: Date,
  rooms: Room[]
): Promise<DayInfo[]> => {
  const endDate = addDays(startDate, 30);
  let revenueOf30Days: any[] = [];
  let transactions: any[] = [];

  try {
    revenueOf30Days = await getRevenueByDayForRange(startDate, endDate);
    transactions = await getTransactionsEachRoom(startDate, endDate);
  } catch (error) {
    console.error('Lỗi khi tính doanh thu:', error);
  }

  return Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startDate, i);
    const revenueDaily = revenueOf30Days.find((item) =>
      isSameDay(new Date(item._id), date)
    )?.totalRevenue;

    console.log('🚀 ~ rooms?.forEach ~ rooms:', rooms);
    let roomsAvailableAllDay: any[] = [];
    let roomsAvailableByHour: any[] = [];

    rooms?.forEach((room) => {
      const availableAllDay = isRoomAvailableAllDay(
        room.roomId,
        date,
        transactions
      );
      const availableByHour =
        !availableAllDay &&
        isRoomAvailableByHour(room.roomId, date, transactions);

      availableAllDay && roomsAvailableAllDay.push(room.name);
      availableByHour && roomsAvailableByHour.push(room.name);
    });

    const status = roomsAvailableAllDay.length
      ? 'allDay'
      : roomsAvailableByHour.length
        ? 'byHour'
        : 'full';

    return {
      date,
      status: status,
      revenue: revenueDaily ?? 0,
      roomsAvailable: roomsAvailableAllDay,
      hourlyRoomsAvailable: roomsAvailableByHour
    } as DayInfo;
  });
};

export default function Calendar() {
  const router = useRouter();

  const [startDate, setStartDate] = useState(startOfToday());
  const [days, setDays] = useState<DayInfo[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [modalOpened, setModalOpened] = useState(false); // Quản lý trạng thái modal
  const [loading, setLoading] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      customerName: '',
      customerPhone: '',
      roomIds: [],
      checkin: null,
      checkout: null,
      amount: 0
    }
  });

  useEffect(() => {
    (async () => {
      try {
        const rooms = await getRooms();
        setRooms(JSON.parse(rooms));
      } catch (error) {
        console.error('Lỗi getRooms');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const days = await generateFakeData(startDate, rooms);
      setDays(days);
    })();
  }, [startDate, rooms]);

  const handlePrev = () => {
    setStartDate((prev) => subDays(prev, 30));
  };

  const handleNext = () => {
    setStartDate((prev) => addDays(prev, 30));
  };

  const handleToday = () => {
    setStartDate(startOfToday());
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const res = await createTransaction({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        checkin: values.checkin,
        checkout: values.checkout,
        amount: values.amount,
        roomIds: values.roomIds
      });

      if (res) {
        const days = await generateFakeData(startDate, rooms);
        setDays(days);
        setLoading(false);
      } else {
        throw new Error('Failed to create a Transaction');
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }

    setModalOpened(false); // Đóng modal sau khi gửi form
  };

  return (
    <Container size="lg" p="md">
      <Center>
        <Text size="xl" weight={700} align="center" mb="lg">
          Nhala Homestay
        </Text>
      </Center>

      {/* Nút Today */}
      <Center>
        <Button onClick={handleToday} color="blue">
          Hôm nay
        </Button>
      </Center>

      {/* Nút mũi tên trái/phải */}
      
      <ActionIcon
        variant="filled"
        size="xl"
        radius="lg"
        aria-label="prev"
        onClick={handlePrev}
        className={`!fixed !-translate-y-2/4 top-1/2 left-2 z-[1000] ${modalOpened && 'invisible'}`}
      >
        <MoveLeft />
      </ActionIcon>

      <ActionIcon
        variant="filled"
        size="xl"
        radius="lg"
        aria-label="next"
        onClick={handleNext}
        className={`!fixed !-translate-y-2/4 top-1/2 right-2 z-[1000] ${modalOpened && 'invisible'}`}
      >
        <MoveRight />
      </ActionIcon>

      {/* Grid Responsive: 3 cột trên mobile, 5 cột trên desktop */}
      <Grid gutter="md" mt={'md'}>
        {days.map(
          ({ date, status, revenue, roomsAvailable, hourlyRoomsAvailable }) => (
            <Grid.Col key={date.toISOString()} span={{ base: 6, md: 2 }}>
              <Card
                shadow="sm"
                padding="lg"
                style={{
                  backgroundColor:
                    status === 'allDay'
                      ? '#69DB7C'
                      : status === 'byHour'
                        ? '#FFE066'
                        : '#E64F57'
                }}
                onClick={() => router.push(`/calendars/${date.getDay()}`)}
              >
                <Text size="lg" weight={600} className="self-center">
                  {format(date, 'dd/MM/yyyy')}
                </Text>
                <Text size="sm" mt="xs">
                  Phòng trống: {roomsAvailable.join(',')}
                </Text>
                <Text size="sm">Phòng theo giờ: {hourlyRoomsAvailable.join(',')}</Text>
                <Badge color="blue" size="md" mt={'sm'} className="self-center">
                  {revenue.toLocaleString()} VND
                </Badge>
              </Card>
            </Grid.Col>
          )
        )}
      </Grid>

      {/* Nút thêm giao dịch sticky ở góc phải */}
      <ActionIcon
        variant="filled"
        size="xl"
        radius="xl"
        aria-label="Add"
        onClick={() => setModalOpened(true)}
        className={`!fixed bottom-5 right-5 z-[1000] ${modalOpened && 'invisible'}`}
      >
        <Plus />
      </ActionIcon>

      {/* Modal Form thêm giao dịch */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          // form.reset();
          setModalOpened(false);
        }}
        title="Tạo Giao Dịch Mới"
        fullScreen
      >
        <form
          onSubmit={form.onSubmit((values, e) => {
            e && e.preventDefault();
            handleSubmit(values);
          })}
        >
          <TextInput
            label="Tên khách"
            placeholder="Tên khách"
            required
            key={form.key('customerName')}
            {...form.getInputProps('customerName')}
          />
          <TextInput
            label="SDT"
            placeholder="SDT"
            required
            key={form.key('customerPhone')}
            {...form.getInputProps('customerPhone')}
          />

          <DateTimePicker
            clearable
            defaultValue={new Date()}
            label="Check-in"
            placeholder="Check-in"
            dropdownType="modal"
            required
            key={form.key('checkin')}
            {...form.getInputProps('checkin')}
          />
          <DateTimePicker
            clearable
            defaultValue={new Date()}
            label="Check-out"
            placeholder="Check-out"
            dropdownType="modal"
            required
            key={form.key('checkout')}
            {...form.getInputProps('checkout')}
          />
          <NumberInput
            label="Số tiền"
            // value={newTransaction.amount}
            thousandSeparator=","
            required
            key={form.key('amount')}
            {...form.getInputProps('amount')}
          />
          <MultiSelect
            label="Chọn phòng"
            placeholder="Chọn phòng"
            data={rooms.map((room) => ({
              label: room.name,
              value: room.roomId.toString()
            }))}
            key={form.key('roomIds')}
            {...form.getInputProps('roomIds')}
          />
          <Group justify="right" mt="md">
            <Button type="submit" loading={loading}>
              Tạo Giao Dịch
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
