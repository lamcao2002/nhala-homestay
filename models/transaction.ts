import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  customerName: string;
  customerPhone: string;
  checkin: Date;
  checkout: Date;
  roomIds: string[];
  amount: number;
}

const TransactionSchema: Schema = new Schema({
  customerName: { type: String},
  customerPhone: { type: String },
  checkin: { type: Date },
  checkout: { type: Date },
  roomIds: { type: [String] },
  amount: { type: Number },
});

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
