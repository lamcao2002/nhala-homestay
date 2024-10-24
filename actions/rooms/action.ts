'use server';

import dbConnect from '@/lib/db';
import Room from '@/models/room';
import { unstable_cache } from 'next/cache';

// export async function getRooms() {
//   await dbConnect();

//   const result = await Room.find({}).select({_id: 0, roomId: 1, name: 1});

//   return JSON.stringify(result);
// }

export const getRooms = unstable_cache(
  async () => {
    await dbConnect();

    const result = await Room.find({}).select({ _id: 0, roomId: 1, name: 1 });

    return JSON.stringify(result);
  },
  ['rooms'],
  { revalidate: 3600, tags: ['rooms'] }
);
