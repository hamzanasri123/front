import { Router } from 'express';
import EventController from '../controllers/events.controller';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';
import multer from 'multer';
import fs from 'fs'
import shortid from 'shortid';

// SET STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let path: string;
        if (file.mimetype.includes('image')) {
            path = 'uploads/events/pictures';
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }
            cb(null, path);
        }
    },
    filename: (req, file, cb) => {
        let a = file.originalname.split('.')
        cb(null, `${shortid.generate()}-${Date.now()}.${a[a.length - 1]}`)
    }
})
const uploadMiddleware = multer({ storage: storage });

class EventsRoute implements Route {
    public path = '/events';
    public router = Router();
    public eventController = new EventController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        //events
        this.router.post(`${this.path}/new`, authMiddleware,uploadMiddleware.single('file'), this.eventController.createEvent);
        this.router.get(`${this.path}/event/:id`, authMiddleware, this.eventController.findEvent);
        this.router.get(`${this.path}/all/`, authMiddleware, this.eventController.findAllEvents);
        this.router.get(`${this.path}/all/:count/:skip/:sort`, authMiddleware, this.eventController.findEventsSorted);
        this.router.get(`${this.path}/user-events/:id`, authMiddleware, this.eventController.findEventByUser);
        this.router.get(`${this.path}/user-events/`, authMiddleware, this.eventController.findEventByUser);
        this.router.get(`${this.path}/month/:month`, authMiddleware, this.eventController.findEventsByMonth);
        this.router.get(`${this.path}/today/`, authMiddleware, this.eventController.findTodayEvents);
        this.router.get(`${this.path}/upcoming/`, authMiddleware, this.eventController.findUpComingEvents);

        this.router.put(`${this.path}/going/eventId`, authMiddleware, this.eventController.addGoingToEvent);
        this.router.put(`${this.path}/interested/eventId`, authMiddleware, this.eventController.addInterestedInEvent);
        this.router.put(`${this.path}/remove-going/eventId`, authMiddleware, this.eventController.removeGoing);
        this.router.put(`${this.path}/remove-interested/eventId`, authMiddleware, this.eventController.removeInterested);
        //TODO : Add event comments...
    }
}

export default EventsRoute;
