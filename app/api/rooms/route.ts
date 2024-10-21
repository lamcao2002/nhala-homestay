import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Room from '@/models/room';

export async function POST(request: any) {
  const { name, description } = await request.json();
  await dbConnect();
  await Room.create({ name, description });
  return NextResponse.json({ message: 'Room Created' }, { status: 201 });
}

export async function GET() {
  await dbConnect();
  const Rooms = await Room.find();
  return NextResponse.json({ Rooms });
}

export async function DELETE(request: any) {
  const id = request.nextUrl.searchParams.get('id');
  await dbConnect();
  await Room.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Room deleted' }, { status: 200 });
}
