'use server';

import dbConnect from '@/lib/db';
import Transaction from '@/models/transaction';
import { startOfDay, endOfDay } from 'date-fns';
import { unstable_cache } from 'next/cache';

export async function createTransaction(data: any) {
  await dbConnect();
  const { customerName, customerPhone, checkin, checkout, roomIds, amount } =
    data;
  const result = await Transaction.create({
    customerName,
    customerPhone,
    checkin,
    checkout,
    roomIds,
    amount
  });
  return JSON.parse(JSON.stringify(result));
}

export const getRevenueByDayForRange = unstable_cache(
  async (startDate: Date, endDate: Date) => {
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
  },
  ['revenueByDays'],
  { revalidate: 3600, tags: ['revenueByDays'] }
);

// export async function getRevenueByDayForRange(startDate: Date, endDate: Date) {
//   await dbConnect();
//   const result = await Transaction.aggregate([
//     {
//       $match: {
//         checkin: { $gte: startDate, $lte: endDate } // Lọc theo khoảng thời gian
//       }
//     },
//     {
//       $group: {
//         _id: {
//           $dateToString: {
//             format: '%Y-%m-%d',
//             date: '$checkin',
//             timezone: '+07:00'
//           }
//         }, // Nhóm theo ngày
//         totalRevenue: { $sum: '$amount' } // Tính tổng doanh thu
//       }
//     },
//     {
//       $sort: { _id: 1 } // Sắp xếp theo ngày tăng dần
//     }
//   ]);

//   return result;
// }

export const getTransactionsEachRoom = unstable_cache(
  async (startDate: Date, endDate: Date) => {
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
  },
  ['transactionsEachRoom'],
  { revalidate: 3600, tags: ['transactionsEachRoom'] }
);

// export async function getTransactionsEachRoom(startDate: Date, endDate: Date) {
//   await dbConnect();

//   const result = await Transaction.aggregate([
//     {
//       $match: {
//         checkin: { $gte: startDate, $lte: endDate } // Lọc theo khoảng thời gian
//       }
//     },
//     {
//       $unwind: {
//         path: '$roomIds',
//         preserveNullAndEmptyArrays: true
//       }
//     },
//     {
//       $sort: { checkin: 1 } // Sắp xếp theo ngày tăng dần
//     }
//   ]);

//   return JSON.parse(JSON.stringify(result));
// }

export const getTransactionsGroupedByRoom = unstable_cache(
  async (date: Date) => {
    await dbConnect();

    const start = startOfDay(date); // 00:00 của ngày được chọn
    const end = endOfDay(date); // 23:59:59 của ngày được chọn

    const result = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { checkin: { $gte: start, $lte: end } }, // Giao dịch có check-in trong ngày
            { checkout: { $gte: start, $lte: end } } // Giao dịch có check-out trong ngày
          ]
        }
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
          totalAmount: { $sum: '$amount' } // Tổng doanh thu cho từng phòng
        }
      }
    ]);

    return JSON.parse(JSON.stringify(result));
  },
  ['transactionsGroupedByRoom'],
  { revalidate: 3600, tags: ['transactionsGroupedByRoom'] }
);

// Hàm lấy danh sách giao dịch group theo phòng
// export async function getTransactionsGroupedByRoom(date: Date) {
//   await dbConnect();

//   const start = startOfDay(date); // 00:00 của ngày được chọn
//   const end = endOfDay(date); // 23:59:59 của ngày được chọn

//   const result = await Transaction.aggregate([
//     {
//       $match: {
//         $or: [
//           { checkin: { $gte: start, $lte: end } }, // Giao dịch có check-in trong ngày
//           { checkout: { $gte: start, $lte: end } } // Giao dịch có check-out trong ngày
//         ]
//       }
//     },
//     {
//       // Tách roomIds để group theo từng phòng
//       $unwind: {
//         path: '$roomIds',
//         preserveNullAndEmptyArrays: true
//       }
//     },
//     {
//       $group: {
//         _id: '$roomIds', // Group theo roomId
//         transactions: { $push: '$$ROOT' }, // Đẩy toàn bộ giao dịch vào mảng
//         totalAmount: { $sum: '$amount' } // Tổng doanh thu cho từng phòng
//       }
//     }
//     // {
//     //   $lookup: {
//     //     from: 'rooms', // Tên collection Room trong MongoDB
//     //     localField: '_id', // roomId trong group
//     //     foreignField: 'roomId', // _id của Room
//     //     as: 'roomInfo', // Đặt tên cho mảng kết quả
//     //   },
//     // },
//     // {
//     //   // Giải nén roomInfo để lấy tên phòng
//     //   $unwind: {
//     //     path: '$roomInfo',
//     //     preserveNullAndEmptyArrays: true
//     //   }
//     // },
//     // {
//     //   $sort: { '_id': 1 }, // Sắp xếp theo roomId tăng dần
//     // },
//   ]);

//   return JSON.parse(JSON.stringify(result));
// }

export const getTransactionsCountByDay = unstable_cache(
  async (startDate: Date, endDate: Date) => {
    await dbConnect();

    const start = startOfDay(startDate); // 00:00:00 của startDate
    const end = endOfDay(endDate); // 23:59:59 của endDate

    const result = await Transaction.aggregate([
      {
        $unwind: {
          path: '$roomIds',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $or: [
            { checkin: { $gte: start, $lte: end } }, // Check-in trong khoảng
            { checkout: { $gte: start, $lte: end } } // Check-out trong khoảng
          ]
        }
      },
      {
        $project: {
          day: {
            $cond: {
              if: { $gte: ['$checkin', start] }, // Nếu check-in trong khoảng, lấy ngày check-in
              then: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$checkin',
                  timezone: '+07:00'
                }
              },
              else: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$checkout',
                  timezone: '+07:00'
                }
              } // Ngược lại, lấy ngày check-out
            }
          }
        }
      },
      {
        $group: {
          _id: '$day', // Group theo ngày
          transactionCount: { $sum: 1 } // Đếm số giao dịch mỗi ngày
        }
      },
      {
        $sort: { _id: 1 } // Sắp xếp theo ngày tăng dần
      }
    ]);

    return JSON.parse(JSON.stringify(result));
  },
  ['transactionsCountByDay'],
  { revalidate: 3600, tags: ['transactionsCountByDay'] }
);

// Hàm lấy số lượng giao dịch theo từng ngày trong khoảng thời gian
// export async function getTransactionsCountByDay(
//   startDate: Date,
//   endDate: Date
// ) {
//   await dbConnect();

//   const start = startOfDay(startDate); // 00:00:00 của startDate
//   const end = endOfDay(endDate); // 23:59:59 của endDate

//   const result = await Transaction.aggregate([
//     {
//       $unwind: {
//         path: '$roomIds',
//         preserveNullAndEmptyArrays: true
//       }
//     },
//     {
//       $match: {
//         $or: [
//           { checkin: { $gte: start, $lte: end } }, // Check-in trong khoảng
//           { checkout: { $gte: start, $lte: end } } // Check-out trong khoảng
//         ]
//       }
//     },
//     {
//       $project: {
//         day: {
//           $cond: {
//             if: { $gte: ['$checkin', start] }, // Nếu check-in trong khoảng, lấy ngày check-in
//             then: {
//               $dateToString: {
//                 format: '%Y-%m-%d',
//                 date: '$checkin',
//                 timezone: '+07:00'
//               }
//             },
//             else: {
//               $dateToString: {
//                 format: '%Y-%m-%d',
//                 date: '$checkout',
//                 timezone: '+07:00'
//               }
//             } // Ngược lại, lấy ngày check-out
//           }
//         }
//       }
//     },
//     {
//       $group: {
//         _id: '$day', // Group theo ngày
//         transactionCount: { $sum: 1 } // Đếm số giao dịch mỗi ngày
//       }
//     },
//     {
//       $sort: { _id: 1 } // Sắp xếp theo ngày tăng dần
//     }
//   ]);

//   return JSON.parse(JSON.stringify(result));
// }
