import { isValidObjectId } from 'mongoose';
import HttpException from '../exceptions/HttpException';
import { Report, User } from '../interfaces/users.interface';
import userModel from '../models/users.model';
import reportModel from '../models/reports.model';
import notificationModel from '../models/notifications.model';
import { Notification } from '../interfaces/posts.interface';

class UserService {
  public users = userModel;

  public async findAllUser(): Promise<User[]> {
    const users: User[] = await this.users.find();
    return users;
  }

  public async findFeedUser(): Promise<{ newestUsers: User[], popularUsers: User[], activeUsers: User[] }> {
    const newestUsers: User[] = await this.users.find().sort('-createdAt').limit(5);
    const popularUsers: User[] = await this.users.aggregate([
      {
        "$project": {
          "fullName": 1,
          "profilePicture": 1,
          "slug": 1,
          "followers": { "$size": "$followers" }
        }
      },
      { "$sort": { "followers": -1 } },
      { "$match": { "followers": { "$gt": 0 } } },
      { "$limit": 5 }
    ]);
    const activeUsers: User[] = [];
    return { popularUsers, newestUsers, activeUsers };
  }

  public async search(keyword): Promise<User[]> {
    let users = await this.users.find({ fullName: { $regex: keyword, "$options": "i" } }).
      select('fullName profilePicture slug');
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    const user: User = await this.users.findOne({ _id: userId }).select('-__v -password');
    if (!user) throw new HttpException(409, "User not found");
    return user;
  }

  public async findUserBySlugOrId(userId: string): Promise<User> {
    let user: User;
    if (isValidObjectId(userId)) {
      user = await this.users.findOne(
        {
          $or: [
            { _id: userId },
            { slug: userId.toLowerCase() }
          ]
        }
      ).select('-__v -password');

    } else {
      user = await this.users.findOne({ slug: userId },).select('-__v -password');
    }
    if (!user) throw new HttpException(409, "User not found");
    return user;
  }

  public async updateProfilePicture(userId: string, profilePicture: string): Promise<User> {
    const user: User = await this.users.findByIdAndUpdate(userId, {
      $set: {
        profilePicture: profilePicture
      },
      $addToSet: {
        pictures: profilePicture
      }
    }, { new: true }).select('-__v -password');
    return user;
  }

  public async updateCoverPhoto(userId: string, coverPicture: string): Promise<User> {
    const user: User = await this.users.findByIdAndUpdate(userId, {
      $addToSet: {
        coverPictures: coverPicture
      }
    }, { new: true }).select('-__v -password');
    return user;
  }

  public async deleteUserData(userId: string): Promise<User> {
    const deleteUserById: User = await this.users.findByIdAndDelete(userId);
    if (!deleteUserById) throw new HttpException(409, "User not found");

    return deleteUserById;
  }

  public async follow(currentUser: User, otherUser_id: string, follow: boolean): Promise<User> {
    if (!isValidObjectId(otherUser_id)) {
      throw new HttpException(409, `Invalid user id :${otherUser_id}`);
    }
    let otherUser: User = await userModel.findById(otherUser_id);
    if (follow) {
      otherUser = await this.users.findByIdAndUpdate(otherUser_id, { $addToSet: { followers: currentUser } }, { new: true }).
        select('-__v -saltSecret -password');
      currentUser = await this.users.findByIdAndUpdate(currentUser, { $addToSet: { following: otherUser_id } }, { new: true })
        .select('-__v -saltSecret -password');

      let notificationData = new Notification();
      notificationData.sender = currentUser;
      notificationData.receiver = otherUser;
      notificationData.type = "followed_you";
      notificationData.content = "followed";
      notificationData.targetId = otherUser_id;
      let notification = new notificationModel(notificationData);
      await notification.save();
    }
    else {
      otherUser = await this.users.findByIdAndUpdate(otherUser_id, { $pull: { followers: currentUser } }, { new: true }).
        select('-__v -saltSecret -password');
      currentUser = await this.users.findByIdAndUpdate(currentUser, { $pull: { following: otherUser } }, { new: true })
        .select('-__v -saltSecret -password');
    }
    return otherUser;
  }

  public async findNotifications(user: User): Promise<Notification[]> {
    const notifications = notificationModel.find({ receiver: user })
      .populate('sender', '_id fullName profilePicture slug')
      .sort('-createdAt')
    return notifications;
  }

  public async createReport(reportData): Promise<Report> {
     let report = new reportModel(reportData);
    return await report.save();
  }

}

export default UserService;
