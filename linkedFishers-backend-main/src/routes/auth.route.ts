import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { CreateUserDto } from '../dtos/users.dto';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';
import validationMiddleware from '../middlewares/validation.middleware';

class AuthRoute implements Route {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/signup`, validationMiddleware(CreateUserDto, 'body'), this.authController.signUp);
    this.router.post(`${this.path}/signin`, validationMiddleware(CreateUserDto, 'body'), this.authController.logIn);
    this.router.post(`${this.path}/logout`, authMiddleware, this.authController.logOut);
    this.router.put(`${this.path}/password`, authMiddleware, this.authController.updatePassword);
    this.router.put(`${this.path}/user/:id`, authMiddleware, this.authController.updateUser);
    this.router.get(`${this.path}/activate/:token`, this.authController.verifyActivationToken);

    this.router.post(`${this.path}/password-reset-request`, this.authController.requestPasswordReset);
    this.router.get(`${this.path}/verify-password-token/:token`, this.authController.verifyResetPasswordToken);
    this.router.post(`${this.path}/reset-password`, this.authController.resetPassword);

  }
}

export default AuthRoute;
