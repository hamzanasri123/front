import { isValidObjectId } from "mongoose";
import HttpException from "../exceptions/HttpException";
import { Event } from "../interfaces/event.interface";
import eventModel from "../models/events.model";
import { isEmptyObject } from "../utils/util";
import moment from 'moment';
class EventService {
    public async createEvent(eventData): Promise<Event> {
        if (isEmptyObject(eventData)) throw new HttpException(400, "Can't create empty event");

        if (eventData.position) {
            eventData.position = {
                coordinates: [
                    Number(eventData.lat),
                    Number(eventData.lng)
                ]
            }
        }

        const event = new eventModel(eventData);
        return await event.save();
    }

    public async addGoingToEvent(eventId, userId): Promise<Event> {
        if (!isValidObjectId(eventId)) throw new HttpException(400, "Invalid event");
        const event = eventModel.findByIdAndUpdate(eventId,
            { $addToSet: { going: { _id: userId } } }, { new: true }
        );
        return event;
    }

    public async removeGoing(eventId, userId): Promise<Event> {
        if (!isValidObjectId(eventId)) throw new HttpException(400, "Invalid event");
        const event = eventModel.findByIdAndUpdate(eventId,
            { $pull: { going: userId } }, { new: true });
        return event;
    }

    public async removeInterested(eventId, userId): Promise<Event> {
        if (!isValidObjectId(eventId)) throw new HttpException(400, "Invalid event");
        const event = eventModel.findByIdAndUpdate(eventId,
            { $pull: { interested: userId } }, { new: true });
        return event;
    }

    public async addInterestedInEvent(eventId, userId): Promise<Event> {
        if (!isValidObjectId(eventId)) throw new HttpException(400, "Invalid event");
        const event = eventModel.findByIdAndUpdate(eventId,
            { $addToSet: { interested: { _id: userId } } }, { new: true }
        );
        return event;
    }

    public async findAllEvents(): Promise<Event[]> {
        const events: Event[] = await eventModel.find();
        return events;
    }

    public async findEventById(eventId: string): Promise<Event> {
        const event: Event = await eventModel.findById(eventId);
        return event;
    }

    public async findEventsByUser(userId: string): Promise<Event[]> {
        const events: Event[] = await eventModel.find({ author: userId })
        return events;
    }

    public async findEventByMonth(month: number): Promise<Event[]> {
        if (month > 12 || month < 0) throw new HttpException(400, "Invalid month");
        let today = new Date();
        const events: Event[] = await eventModel.aggregate([
            { $project: { name: 1, description: 1, startDate: 1, endDate: 1, "month": { $month: '$startDate' }, "year": { $year: '$startDate' } } },
            { $match: { month: month + 1 } },
            { $match: { year: today.getFullYear() } }
        ]);
        return events;
    }

    public async findTodayEvents(): Promise<Event[]> {
        const today = moment().startOf('day')
        const events: Event[] = await eventModel.find({
            startDate: {
                $gte: today.toDate(),
                $lte: moment(today).endOf('day').toDate()
            }
        })
        return events;
    }

    public async findUpcomingEvents(): Promise<Event[]> {
        const today = moment().add(1, 'day').startOf('day');
        const events: Event[] = await eventModel.find({
            startDate: {
                $gt: today.toDate(),
            }
        }).sort({ startDAte: 1 }).limit(4);
        return events;
    }

    public async findEventsSorted(limit: number, skip: number, sort: string): Promise<{ events: Event[], count: number }> {
        //sort = [ startDate || createdAt || going || comments ]
        let count: number = await eventModel.countDocuments({ endDate: { $gte: new Date() } });
        count = Math.ceil(count / limit);
        let events: Event[];
        switch (sort) {
            case 'startDate':
                events = await eventModel.find({ endDate: { $gte: new Date() } })
                    .sort('startDate')
                    .sort('-createdAt')
                    .skip(skip).limit(limit).lean().exec();
                break;
            case 'createdAt':
                events = await eventModel.find({ endDate: { $gte: new Date() } })
                    .sort('-createdAt')
                    .skip(skip).limit(limit).lean().exec();
                break;
            case 'going':
                events = await eventModel.aggregate([
                    {
                        $project: {
                            "name": 1,
                            "endDate": 1,
                            "startDate": 1,
                            "host": 1,
                            "going": 1,
                            "interested": 1,
                            "fullName": 1,
                            "createdAt": 1,
                            "goingCount": { "$add": [{ "$size": "$going" }, { "$size": "$going" }, { "$size": "$interested" }] }
                        }
                    },
                    { $sort: { "goingCount": -1 } },
                    { $match: { endDate: { $gte: new Date() } } }
                ]);
                break;
            case 'comments':
                events = await eventModel.find({ endDate: { $gte: new Date() } })
                    .sort("-comments")
                    .sort('-createdAt')
                    .skip(skip).limit(limit).lean().exec();
                break;
            default:
                break;
        }
        return { events, count };
    }
}

export default EventService;
