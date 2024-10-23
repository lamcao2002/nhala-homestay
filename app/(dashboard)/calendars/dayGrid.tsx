import { Badge, Card, Grid, Skeleton, Text } from '@mantine/core';
import { format } from 'date-fns';

import { useRouter } from 'next/navigation';

interface DayInfo {
  date: Date;
  status: 'allDay' | 'byHour' | 'full';
  revenue: number;
  roomsAvailable: string[];
  hourlyRoomsAvailable: string[];
}

export default function DayGrid({
  days,
  loading
}: {
  days: DayInfo[];
  loading: boolean;
}) {
  const router = useRouter();

  if (!days.length) {

    return (
      <Grid gutter="md" mt={'md'}>
        {Array(30)
          .fill(0)
          .map((item, index) => (
            <Grid.Col key={index} span={{ base: 6, md: 2 }} className="h-52">
              <div className="flex flex-col justify-around w-full h-full">
                <Skeleton height={20} radius="xl" />
                <Skeleton height={20} radius="xl" />
                <Skeleton height={20} radius="xl" />
                <Skeleton height={20} radius="xl" />
              </div>
            </Grid.Col>
          ))}
      </Grid>
    );
  }

  return (
    <Grid gutter="md" mt={'md'}>
      {days.map(
        ({ date, status, revenue, roomsAvailable, hourlyRoomsAvailable }) => (
          <Grid.Col
            key={date.toISOString()}
            span={{ base: 6, md: 2 }}
            className="h-52"
          >
            {loading ? (
              <div className="flex flex-col justify-around w-full h-full">
                <Skeleton height={20} radius="xl" />
                <Skeleton height={20} radius="xl" />
                <Skeleton height={20} radius="xl" />
                <Skeleton height={20} radius="xl" />
              </div>
            ) : (
              <Card
                shadow="sm"
                padding="lg"
                className="justify-between h-full"
                style={{
                  backgroundColor:
                    status === 'allDay'
                      ? '#69DB7C'
                      : status === 'byHour'
                        ? '#FFE066'
                        : '#E64F57'
                }}
                onClick={() => router.push(`/calendars/${date.getDay()}?date=${date.toDateString()}`)}
              >
                <Text size="lg" weight={600} className="self-center">
                  {format(date, 'dd/MM/yyyy')}
                </Text>
                <Text size="sm" mt="xs">
                  Phòng trống: {roomsAvailable.join(',')}
                </Text>
                <Text size="sm">
                  Phòng theo giờ: {hourlyRoomsAvailable.join(',')}
                </Text>
                <Badge color="blue" size="md" mt={'sm'} className="self-center">
                  {revenue.toLocaleString()} VND
                </Badge>
              </Card>
            )}
          </Grid.Col>
        )
      )}
    </Grid>
  );
}
