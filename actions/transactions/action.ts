'use server';

import dbConnect from '@/lib/db';
import Transaction from '@/models/transaction';

export async function createTransaction(data: any) {
  await dbConnect();
  const { customerName, customerPhone, checkin, checkout, roomIds, amount } = data;
  const result = await Transaction.create({ customerName, customerPhone, checkin, checkout, roomIds, amount });
  return result.toObject();
}

export async function getRevenueByDayForRange(startDate: Date, endDate: Date) {
  await dbConnect();
  const result = await Transaction.aggregate([
    {
      $match: {
        checkin: { $gte: startDate, $lte: endDate } // Lọc theo khoảng thời gian
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$checkin',
            timezone: '+07:00'
          }
        }, // Nhóm theo ngày
        totalRevenue: { $sum: '$amount' } // Tính tổng doanh thu
      }
    },
    {
      $sort: { _id: 1 } // Sắp xếp theo ngày tăng dần
    }
  ]);

  return result;
}

export async function getTransactionsEachRoom(startDate: Date, endDate: Date) {
  await dbConnect();

  const result = await Transaction.aggregate([
    {
      $match: {
        checkin: { $gte: startDate, $lte: endDate } // Lọc theo khoảng thời gian
      }
    },
    {
      $unwind: {
        path: '$roomIds',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $sort: { checkin: 1 } // Sắp xếp theo ngày tăng dần
    }
  ]);

  return JSON.parse(JSON.stringify(result));
}
