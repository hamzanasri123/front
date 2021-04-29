import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '../dtos/users.dto';
import { RequestWithFile, RequestWithUser } from '../interfaces/auth.interface';
import { Notification } from '../interfaces/posts.interface';
import { Report, User } from '../interfaces/users.interface';
import userService from '../services/users.service';

class UsersController {
  public userService = new userService();

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getFeedUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.userService.findFeedUser();

      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const k = req.params.keyword
      const data = await this.userService.search(k);

      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const findOneUserData: User = await this.userService.findUserBySlugOrId(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public updateProfilePicture = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user._id
      const picture = req.file.path.split('/').splice(1).join('/');
      const user: User = await this.userService.updateProfilePicture(userId, picture);
      res.status(200).json({ data: user, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public updateCoverPhoto = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user._id
      const picture = req.file.path.split('/').splice(1).join('/');
      const user: User = await this.userService.updateCoverPhoto(userId, picture);
      res.status(200).json({ data: user, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public follow = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = await this.userService.follow(req.user, req.params.id, req.body.follow);
      res.status(200).json({ data: user, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getNotifications = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notifications: Notification[] = await this.userService.findNotifications(req.user);
      res.status(200).json({ data: notifications });
    } catch (error) {
      next(error);
    }
  };

  public reportUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reportData = req.body;
      reportData.author = req.user;
      const report: Report = await this.userService.createReport(req.body);
      res.status(200).json({ data: { content: report.content } });
    } catch (error) {
      next(error);
    }
  };

  // public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const userId = req.params.id;
  //     const deleteUserData: User[] = await this.userService.deleteUser(userId);

  //     res.status(200).json({ data: deleteUserData, message: 'deleted' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}

export default UsersController;
