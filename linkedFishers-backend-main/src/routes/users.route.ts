import { Router } from 'express';
import UsersController from '../controllers/users.controller';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';
import multer from 'multer';
import fs from 'fs'
import shortid from 'shortid';

// SET STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      let path = 'uploads/profilePictures';
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

const upload = multer({ storage: storage });


class UsersRoute implements Route {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.usersController.getUsers);
    this.router.get(`${this.path}/user/:id`, authMiddleware, this.usersController.getUserById);
    this.router.post(`${this.path}/user/profile-picture`, authMiddleware, upload.single('file'), this.usersController.updateProfilePicture);
    this.router.post(`${this.path}/user/cover-photo`, authMiddleware, upload.single('file'), this.usersController.updateCoverPhoto);
    this.router.put(`${this.path}/follow/:id`, authMiddleware, this.usersController.follow);
    // this.router.delete(`${this.path}/:id(\\d+)`, this.usersController.deleteUser);

    this.router.get(`${this.path}/feed`, this.usersController.getFeedUsers);
    this.router.get(`${this.path}/notifications`, authMiddleware, this.usersController.getNotifications);
    this.router.get(`${this.path}/search/:keyword`, this.usersController.search);

    this.router.post(`${this.path}/report`, authMiddleware, this.usersController.reportUser);
  }
}

export default UsersRoute;
