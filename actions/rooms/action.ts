'use server';

import Room from '@/models/room';

export async function getRooms() {
  const result = await Room.find({}).select({_id: 0, roomId: 1, name: 1});

  return JSON.stringify(result);
}
