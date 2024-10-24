'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useEffect, useState } from 'react';
import { format, getHours, getMinutes, parse, set } from 'date-fns';
import {
  Card,
  Container,
  Group,
  Text,
  Button,
  Modal,
  Center,
  Grid,
  Popover,
  ActionIcon,
  TextInput,
  NumberInput,
  MultiSelect
} from '@mantine/core';
import Timeline from './timeline';
import { getRooms } from '@/actions/rooms/action';
import { ITransaction } from '@/models/transaction';
import {
  createTransaction,
  getTransactionsGroupedByRoom
} from '@/actions/transactions/action';
import { Plus, SquareArrowOutUpRight } from 'lucide-react';
import CustomesTable from 'app/(dashboard)/customers/customersTable';
import { useForm } from '@mantine/form';
import { TimeInput } from '@mantine/dates';

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
  console.log("🚀 ~ DayDetails ~ dateTarget:", dateTarget)
  const dateFormat = dateTarget ? new Date(dateTarget) : new Date();
  console.log("🚀 ~ DayDetails ~ dateFormat:", dateFormat)

  const [selectedRoom, setSelectedRoom] = useState<TransactionsByRoom | null>(
    null
  );
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [modalAddOpened, setModalAddOpened] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [transactionsByRoom, setTransactionsByRoom] = useState<any[]>([]);
  const [dataCombine, setDataCombine] = useState<TransactionsByRoom[]>([]);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      customerName: '',
      customerPhone: '',
      roomIds: [],
      checkin: set(dateFormat, { hours: 9, minutes: 0 }) as Date,
      checkout: set(dateFormat, { hours: 12, minutes: 0 }) as Date,
      amount: null
    }
  });

  const handleRoomClick = (room: TransactionsByRoom) => {
    setSelectedRoom(room);
    setModalOpened(true);
  };

  const handleSubmit = async (values: any) => {
    setLoadingAdd(true);

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
        const transactionsByRoom =
          await getTransactionsGroupedByRoom(dateFormat);
        setTransactionsByRoom(transactionsByRoom);
        setLoadingAdd(false);
      } else {
        throw new Error('Failed to create a Transaction');
      }
    } catch (error) {
      console.log(error);
      setLoadingAdd(false);
    }

    setModalAddOpened(false); // Đóng modal sau khi gửi form
    form.reset();
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
            >
              <div className="flex justify-between mb-2">
                <Text size="lg" weight={600}>
                  Phòng {data.name}
                </Text>
                <ActionIcon
                  variant="transparent"
                  size="md"
                  aria-label="openDetail"
                  onClick={() => handleRoomClick(data)}
                >
                  <SquareArrowOutUpRight color="#000000" />
                </ActionIcon>
              </div>
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

      {/* Modal Chi Tiết Phòng */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={`Phòng ${selectedRoom?.name} - Ngày ${format(dateFormat, 'dd/MM/yyyy')}`}
      >
        {selectedRoom && selectedRoom?.transactions?.length ? (
          <>
            <CustomesTable customers={selectedRoom?.transactions} />
          </>
        ) : (
          <Text size="lg" weight={600} mb="sm">
            Phòng trống - chưa có khách
          </Text>
        )}
      </Modal>

      {/* Nút thêm giao dịch sticky ở góc phải */}
      <ActionIcon
        variant="filled"
        size="xl"
        radius="xl"
        aria-label="Add"
        onClick={() => setModalAddOpened(true)}
        className={`!fixed bottom-5 right-5 z-[1000] ${modalAddOpened && 'invisible'}`}
      >
        <Plus />
      </ActionIcon>

      {/* Modal Form thêm giao dịch */}
      <Modal
        opened={modalAddOpened}
        onClose={() => {
          setModalAddOpened(false);
        }}
        title={`Tạo Booking Mới của ngày ${format(dateFormat, 'dd/MM/yyyy')}`}
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
            size="md"
          />
          <TextInput
            label="SDT"
            placeholder="SDT"
            required
            key={form.key('customerPhone')}
            {...form.getInputProps('customerPhone')}
            size="md"
          />

          <TimeInput
            size="md"
            label="Giờ Checkin"
            required
            defaultValue={'09:00'}
            onChange={(event) => {
              const time = parse(
                event.currentTarget.value,
                'HH:mm',
                new Date()
              );
              form.setFieldValue('checkin', (prev) =>
                set(prev, { hours: getHours(time), minutes: getMinutes(time) })
              );

              console.log(form.getValues());
            }}
          />
          <TimeInput
            size="md"
            label="Giờ Checkout"
            required
            defaultValue={'12:00'}
            onChange={(event) => {
              const time = parse(
                event.currentTarget.value,
                'HH:mm',
                new Date()
              );
              form.setFieldValue('checkout', (prev) =>
                set(prev, { hours: getHours(time), minutes: getMinutes(time) })
              );
            }}
          />

          <NumberInput
            label="Số tiền"
            thousandSeparator=","
            required
            key={form.key('amount')}
            {...form.getInputProps('amount')}
            size="md"
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
            size="md"
          />
          <Group justify="right" mt="md">
            <Button type="submit" loading={loadingAdd} size="md">
              Tạo Booking
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
