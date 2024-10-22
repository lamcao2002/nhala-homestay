import mongoose, { Schema, Document, Model } from 'mongoose';

interface IRoom extends Document {
  roomId: string;
  name: string;
  description: string;
}

const RoomSchema: Schema = new Schema({
  roomId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
});

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
