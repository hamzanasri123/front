import { NextFunction, Response } from "express";
import { RequestWithFile, RequestWithUser } from "../interfaces/auth.interface";
import { Event } from "../interfaces/event.interface";
import { User } from "../interfaces/users.interface";
import EventService from "../services/events.service"
import { isNullOrEmpty } from "../utils/util";

class EventController {
    public eventService = new EventService();

    public createEvent = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const eventData = req.body;
            eventData.host = user._id;
            if (req.file) {
                eventData.image = req.file.path.split('/').splice(1).join('/');
            }
            const event: Event = await this.eventService.createEvent(eventData);
            res.status(201).json({ data: event, message: 'Created Event' });
        } catch (error) {
            next(error);
        }
    };

    public findEvent = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const event: Event = await this.eventService.findEventById(req.params.id);
            res.status(201).json({ data: event });
        } catch (error) {
            next(error);
        }
    }

    public findEventByUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            let userId = req.params.id;
            if (isNullOrEmpty(userId)) {
                userId = req.user._id;
            }
            const events: Event[] = await this.eventService.findEventsByUser(userId);
            res.status(201).json({ data: events });
        } catch (error) {
            next(error);
        }
    }

    public findAllEvents = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const events: Event[] = await this.eventService.findAllEvents();
            res.status(201).json({ data: events });
        } catch (error) {
            next(error);
        }
    }

    public findEventsByMonth = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            let month = Number(req.params.month);
            const events: Event[] = await this.eventService.findEventByMonth(month);
            res.status(201).json({ data: events });
        } catch (error) {
            next(error);
        }
    }

    public findTodayEvents = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const events: Event[] = await this.eventService.findTodayEvents();
            res.status(201).json({ data: events });
        } catch (error) {
            next(error);
        }
    }

    public findUpComingEvents = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const events: Event[] = await this.eventService.findUpcomingEvents();
            res.status(201).json({ data: events });
        } catch (error) {
            next(error);
        }
    }

    public findEventsSorted = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            let limit = Number(req.params.limit) || 5;
            let skip = Number(req.params.skip) * limit || 0;
            let sort = req.params.sort
            const { events, count } = await this.eventService.findEventsSorted(limit, skip, sort);
            res.status(201).json({ data: events, count });
        } catch (error) {
            next(error);
        }
    }

    public addGoingToEvent = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = req.params.eventId;
            const userId = req.user._id;
            const event: Event = await this.eventService.addGoingToEvent(eventId, userId);
            res.status(201).json({ data: event });
        } catch (error) {
            next(error);
        }
    }
    public removeGoing = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = req.params.eventId;
            const userId = req.user._id;
            const event: Event = await this.eventService.removeGoing(eventId, userId);
            res.status(201).json({ data: event });
        } catch (error) {
            next(error);
        }
    }
    public removeInterested = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = req.params.eventId;
            const userId = req.user._id;
            const event: Event = await this.eventService.removeInterested(eventId, userId);
            res.status(201).json({ data: event });
        } catch (error) {
            next(error);
        }
    }
    public addInterestedInEvent = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = req.params.eventId;
            const userId = req.user._id;
            const event: Event = await this.eventService.addInterestedInEvent(eventId, userId);
            res.status(201).json({ data: event });
        } catch (error) {
            next(error);
        }
    }
}

export default EventController