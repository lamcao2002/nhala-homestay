import mongoose, { Schema, Document, Model } from 'mongoose';

interface IRoom extends Document {
  name: string;
  description: string;
}

const RoomSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
});

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
