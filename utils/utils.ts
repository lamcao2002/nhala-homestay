interface Transaction {
  roomIds: string;
  checkin: Date;
  checkout: Date;
}

export function isRoomAvailableAllDay(
  roomId: string,
  date: Date,
  transactions: Transaction[]
): boolean {
  const start = new Date(date);
  start.setHours(14, 0, 0, 0); // 14:00 hôm nay

  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  end.setHours(12, 0, 0, 0); // 12:00 ngày hôm sau

  // Kiểm tra nếu có bất kỳ giao dịch nào trong khoảng từ 14:00 - 12:00
  return !transactions.some(
    (transaction) =>
      transaction.roomIds === roomId &&
      ((new Date(transaction.checkin) >= start && new Date(transaction.checkin) < end) || // Check-in trong khoảng thời gian này
        (new Date(transaction.checkout) > start && new Date(transaction.checkout) <= end) || // Check-out trong khoảng thời gian này
        (new Date(transaction.checkin) < start && new Date(transaction.checkout) > end)) // Giao dịch bao trùm khoảng thời gian này
  );
}

export function isRoomAvailableByHour(
  roomId: string,
  date: Date,
  transactions: Transaction[]
): boolean {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0); // 00:00 hôm nay

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999); // 23:59 hôm nay

  // Lấy các giao dịch trong ngày
  const roomTransactions = transactions.filter(
    (transaction) =>
      transaction.roomIds === roomId &&
      new Date(transaction.checkin) >= startOfDay &&
      new Date(transaction.checkout) <= endOfDay
  );

  // Sắp xếp các giao dịch theo thời gian check-in
  roomTransactions.sort((a, b) => new Date(a.checkin).getTime() - new Date(b.checkin).getTime());

  // Kiểm tra nếu có khoảng trống >= 3 giờ giữa các giao dịch
  let previousCheckout = startOfDay;

  for (const transaction of roomTransactions) {
    const gapInHours =
      (new Date(transaction.checkin).getTime() - previousCheckout.getTime()) /
      (1000 * 60 * 60);

    if (gapInHours >= 3) {
      return true; // Có ít nhất 3 giờ trống giữa các giao dịch
    }

    previousCheckout = new Date(transaction.checkout);
  }

  // Kiểm tra khoảng trống từ giao dịch cuối cùng đến hết ngày
  const finalGapInHours =
    (endOfDay.getTime() - previousCheckout.getTime()) / (1000 * 60 * 60);

  return finalGapInHours >= 3;
}
