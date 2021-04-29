import mongoose from 'mongoose';
import { Event } from '../interfaces/event.interface';

const eventShema = new mongoose.Schema({
    name: String,
    endDate: { type: Date },
    startDate: { type: Date, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    going: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    interested: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    description: String,
    position: {
        coordinates: { type: [Number], index: '2dsphere' }
    },
    country: Object,
    tags: [{ type: String }],
    comments: mongoose.Schema.Types.Number,
    image: String
});

eventShema.set('timestamps', true);
const eventModel = mongoose.model<Event & mongoose.Document>('Event', eventShema);

export default eventModel;
