import mongoose from 'mongoose';
import { Notification } from '../interfaces/posts.interface';

const notificationSchema = new mongoose.Schema({
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: String,
    is_read: { type: Boolean, default: false },
    targetId: { type: mongoose.Schema.Types.ObjectId }
});

notificationSchema.set('timestamps', true);
const notificationModel = mongoose.model<Notification & mongoose.Document>('Notification', notificationSchema);

export default notificationModel;
