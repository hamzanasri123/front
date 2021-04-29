import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '../dtos/users.dto';
import { RequestWithUser, TokenData } from '../interfaces/auth.interface';
import { User } from '../interfaces/users.interface';
import AuthService from '../services/auth.service';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const message: string = await this.authService.signup(userData);

      res.status(201).json({ message });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const tokenData: TokenData = await this.authService.login(userData);
      res.status(200).json({ data: tokenData, message: 'logged in' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.authService.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: logOutUserData, message: 'logout' });
    } catch (error) {
      next(error);
    }
  };
  public updatePassword = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user: User = req.user;
      const { oldPassword, newPassword } = req.body;
      const tokenData: TokenData = await this.authService.updatePassword(user, oldPassword, newPassword);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ data: tokenData, message: 'Password updated!' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const userData: User = req.body;
      userData._id = req.user._id;
      const tokenData: TokenData = await this.authService.updateUser(userId, userData);

      res.status(200).json({ data: tokenData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public verifyActivationToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activationToken = req.params.token;
      const user: User = await this.authService.verifyActivationToken(activationToken);

      res.status(200).json({ data: user, message: 'Verified' });
    } catch (error) {
      next(error);
    }
  };

  public requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(req.body);
      const email = req.body.email;
      const response = await this.authService.requestPasswordReset(email);
      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  };


  public verifyResetPasswordToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.params.token;
      const user: User = await this.authService.verifyResetPasswordToken(token);
      res.status(200).json({ message: 'Valid token' });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const password = req.body.password;
      const token = req.body.passwordToken;
      const tokenData: TokenData = await this.authService.resetPassword(token, password);
      res.status(200).json({ data: tokenData, message: 'Password reset!' });
    } catch (error) {
      next(error);
    }
  };

}

export default AuthController;
