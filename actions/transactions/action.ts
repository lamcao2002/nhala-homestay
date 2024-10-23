'use server';

import dbConnect from '@/lib/db';
import Transaction from '@/models/transaction';
import { startOfDay, endOfDay } from 'date-fns';

export async function createTransaction(data: any) {
  await dbConnect();
  const { customerName, customerPhone, checkin, checkout, roomIds, amount } = data;
  const result = await Transaction.create({ customerName, customerPhone, checkin, checkout, roomIds, amount });
  return JSON.parse(JSON.stringify(result));
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


// Hàm lấy danh sách giao dịch group theo phòng
export async function getTransactionsGroupedByRoom(date: Date) {
  const start = startOfDay(date); // 00:00 của ngày được chọn
  const end = endOfDay(date); // 23:59:59 của ngày được chọn

  const result = await Transaction.aggregate([
    {
      $match: {
        $or: [
          { checkin: { $gte: start, $lte: end } }, // Giao dịch có check-in trong ngày
          { checkout: { $gte: start, $lte: end } }, // Giao dịch có check-out trong ngày
        ],
      },
    },
    {
      // Tách roomIds để group theo từng phòng
      $unwind: {
        path: '$roomIds',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$roomIds', // Group theo roomId
        transactions: { $push: '$$ROOT' }, // Đẩy toàn bộ giao dịch vào mảng
        totalAmount: { $sum: '$amount' }, // Tổng doanh thu cho từng phòng
      },
    },
    // {
    //   $lookup: {
    //     from: 'rooms', // Tên collection Room trong MongoDB
    //     localField: '_id', // roomId trong group
    //     foreignField: 'roomId', // _id của Room
    //     as: 'roomInfo', // Đặt tên cho mảng kết quả
    //   },
    // },
    // {
    //   // Giải nén roomInfo để lấy tên phòng
    //   $unwind: {
    //     path: '$roomInfo',
    //     preserveNullAndEmptyArrays: true
    //   }
    // },
    // {
    //   $sort: { '_id': 1 }, // Sắp xếp theo roomId tăng dần
    // },
  ]);

  return JSON.parse(JSON.stringify(result));
}

