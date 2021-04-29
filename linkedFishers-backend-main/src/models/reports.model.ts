import mongoose from 'mongoose';
import { Report } from '../interfaces/users.interface';

const reportSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: String,
    is_read: { type: Boolean, default: false },
});

reportSchema.set('timestamps', true);
const reportModel = mongoose.model<Report & mongoose.Document>('Report', reportSchema);

export default reportModel;
