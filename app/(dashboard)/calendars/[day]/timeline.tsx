import { ITransaction } from '@/models/transaction';
import { Popover, Text } from '@mantine/core';
import { differenceInHours, endOfDay, formatDate, startOfDay } from 'date-fns';
import { FC } from 'react';

const getPercentage = (time: Date, startOfDay: number) => {
  const timeOfOneDay = 24 * 60 * 60 * 1000 - 1; // milisecond of 1 day
  return ((time.getTime() - startOfDay) / timeOfOneDay) * 100;
};

const getEmptySlots = (
  bookings: ITransaction[] | undefined,
  startOfDay: number,
  endOfDay: number
) => {
  if (!bookings || bookings.length === 0) {
    // Nếu không có booking, trả về một khoảng trống toàn bộ ngày
    return [{ start: startOfDay, end: endOfDay}];
  }

  const sortedBookings = [...bookings]?.sort(
    (a, b) => a.checkin.getTime() - b.checkin.getTime()
  );

  const emptySlots = [];

  if (getPercentage(sortedBookings[0].checkin, startOfDay) > 0) {
    emptySlots.push({
      start: startOfDay,
      end: sortedBookings[0].checkin.getTime()
    });
  }

  for (let i = 0; i < sortedBookings.length - 1; i++) {
    const currentEnd = sortedBookings[i].checkout.getTime();
    const nextStart = sortedBookings[i + 1].checkin.getTime();

    if (nextStart > currentEnd) {
      emptySlots.push({ start: currentEnd, end: nextStart });
    }
  }

  const lastBookingEnd =
    sortedBookings[sortedBookings.length - 1].checkout.getTime();
  if (lastBookingEnd < endOfDay) {
    emptySlots.push({ start: lastBookingEnd, end: endOfDay });
  }

  return emptySlots;
};

const Timeline: FC<{ bookings: ITransaction[]; date: Date }> = ({
  bookings,
  date
}) => {
  const startDay = startOfDay(date).getTime();
  const endDay = endOfDay(date).getTime();

  const emptySlots = getEmptySlots(bookings, startDay, endDay);

  const formatTime = (date: Date) => formatDate(date, 'HH:mm');

  return (
    <div className="relative w-full bg-gray-200 h-9">
      {bookings?.map((booking, index) => {
        const left = Math.max(0, getPercentage(booking.checkin, startDay)); // Không cho phần âm
        const width = Math.min(
          100 - left,
          getPercentage(booking.checkout, startDay) - left
        ); // Không cho vượt quá 100%

        const isCrossingDayCheckin = booking.checkin.getTime() < startDay;

        const isCrossingDayCheckout = booking.checkout.getTime() > endDay;

        return (
          <Popover position="top" withArrow shadow="md">
            <Popover.Target>
              <div
                key={index}
                className={`absolute top-0 h-full bg-red-500`}
                style={{ left: `${left}%`, width: `${width}%` }}
              ></div>
            </Popover.Target>
            <Popover.Dropdown>
              <div className="flex">
                <Text
                  size="sm"
                  c={isCrossingDayCheckin ? 'red' : '#000000'}
                  mr={'4px'}
                >
                  {formatTime(booking.checkin)}
                </Text>
                <Text size="sm" c={isCrossingDayCheckout ? 'red' : '#000000'}>
                  - {formatTime(booking.checkout)}
                </Text>
              </div>
            </Popover.Dropdown>
          </Popover>
        );
      })}

      {emptySlots.map((slot, index) => {
        const left = getPercentage(new Date(slot.start), startDay);
        const width =
          getPercentage(new Date(slot.end), startDay) -
          getPercentage(new Date(slot.start), startDay);

        const durationHours = differenceInHours(
          new Date(slot.end),
          new Date(slot.start)
        );

        return (
          <Popover position="top" withArrow shadow="md">
            <Popover.Target>
              <div
                key={`empty-${index}`}
                className={`absolute top-0 h-full ${durationHours < 3 ? 'bg-unavailable-booking' : 'bg-white'}`}
                style={{ left: `${left}%`, width: `${width}%` }}
              ></div>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm" c={durationHours < 3 ? 'orange' : 'green'}>
                {formatTime(new Date(slot.start))} -{' '}
                {formatTime(new Date(slot.end))}
              </Text>
            </Popover.Dropdown>
          </Popover>
        );
      })}
    </div>
  );
};

export default Timeline;
