import mongoose from 'mongoose';
import { Post } from '../interfaces/posts.interface';
const postSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachment: String,
    attachmentType: String,
    position: {
        coordinates: { type: [Number], index: '2dsphere' }
    },
    country: Object,
    // equipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: false }],
    reacts: [{
        _id: {},
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, },
        reactType: { type: String, enum: ['like', 'love', 'dislike', 'haha', 'sad', 'wow'] }
    }],
    comments: mongoose.Schema.Types.Number,
    tags: [String]
});

postSchema.set('timestamps', true);
const postModel = mongoose.model<Post & mongoose.Document>('Post', postSchema);

export default postModel;
