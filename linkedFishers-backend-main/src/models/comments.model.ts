import mongoose from 'mongoose';
import { Comment } from '../interfaces/posts.interface';

const commentSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: false },
    // event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: false },
});

commentSchema.set('timestamps', true);
const commentModel = mongoose.model<Comment & mongoose.Document>('Comment', commentSchema);

export default commentModel;