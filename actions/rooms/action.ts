'use server';

import dbConnect from '@/lib/db';
import Room from '@/models/room';

export async function getRooms() {
  await dbConnect();

  const result = await Room.find({}).select({_id: 0, roomId: 1, name: 1});

  return JSON.stringify(result);
}
