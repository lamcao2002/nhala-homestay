import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/transaction';

export async function POST(request: any) {
  const { customerName, customerPhone, checkin, checkout, roomIds, amount } = await request.json();
  await dbConnect();
  await Transaction.create({ customerName, customerPhone, checkin, checkout, roomIds, amount });
  return NextResponse.json({ message: 'Transaction Created' }, { status: 201 });
}

export async function GET() {
  await dbConnect();
  const Transactions = await Transaction.find();
  return NextResponse.json({ Transactions });
}

export async function DELETE(request: any) {
  const id = request.nextUrl.searchParams.get('id');
  await dbConnect();
  await Transaction.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Transaction deleted' }, { status: 200 });
}