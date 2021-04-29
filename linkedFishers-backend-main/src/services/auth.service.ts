import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CreateUserDto } from '../dtos/users.dto';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface';
import { User } from '../interfaces/users.interface';
import userModel from '../models/users.model';
import { isEmptyObject, isNullOrEmpty, slugify, randomString } from '../utils/util';
import shortid from 'shortid';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  public users = userModel;

  public async signup(userData: CreateUserDto): Promise<string> {
    if (isEmptyObject(userData)) throw new HttpException(400, 'All fields are required');

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `Email address ${userData.email} already exists`);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const u = new this.users({ ...userData, password: hashedPassword });
    u.slug = slugify(u.fullName);
    u.activated = false;
    if (this.users.exists({ slug: u.slug })) {
      u.slug = u.slug + shortid.generate();
    }

    u.confirmationToken = uuidv4() + randomString(60) + shortid.generate();
    u.activated = false;

    let url = `http://linkedfishers.com/activate/${u.confirmationToken}`;
    try {
      await this.sendConfirmationEmail(u, url);
    } catch (err) {
      if (isEmptyObject(userData)) throw new HttpException(500, err);
    }
    const createUserData: User = await u.save();
    return "Sent confirmation mail";
  }

  public async requestPasswordReset(email: string) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const resetPasswordToken = randomString(60) + shortid.generate() + uuidv4();
    const user = await this.users.findOneAndUpdate({ email: email }, {
      $set: {
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpires: tomorrow
      }
    });

    if (!user) {
      throw new HttpException(400, 'No user with this email');
    }

    let url = `http://linkedfishers.com/reset-password/${resetPasswordToken}`;
    this.sendPasswordResetEmail(user, url);
    return "Sent Reset password mail";
  }

  public async verifyResetPasswordToken(token: string): Promise<User> {
    if (!token) {
      throw new HttpException(409, "Missing token!");
    }
    let user: User = await this.users.findOne({ resetPasswordToken: token });
    if (!user) {
      throw new HttpException(409, "Invalid password token");
    }
    if (user.resetPasswordExpires < new Date()) {
      throw new HttpException(409, "Token expired");
    }
    return user
  }

  public async resetPassword(token: string, newPassword: string) {
    let user: User = await this.verifyResetPasswordToken(token);
    if (!user) {
      throw new HttpException(409, "Token expired");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user = await this.users.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
      },
      $unset: {
        resetPasswordExpires: "",
        resetPasswordToken: ""
      }
    });
    const tokenData = this.createToken(user);
    return tokenData;
  }

  public async login(userData: CreateUserDto): Promise<TokenData> {
    if (isEmptyObject(userData)) throw new HttpException(400, 'Missing credentials');

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `No user was found with email address: ${userData.email}`);

    const isPasswordMatching: boolean = await bcrypt.compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Wrong password!');

    if (!findUser.activated) {
      throw new HttpException(409, 'Email not verified');
    }
    const tokenData = this.createToken(findUser);
    return tokenData;
  }

  public async verifyActivationToken(token: string): Promise<User> {
    let user: User = await this.users.findOne({ confirmationToken: token });
    if (!user || user.activated) {
      throw new HttpException(409, "Invalid confirmation token");
    }
    await this.users.findByIdAndUpdate(user._id, { $set: { activated: true }, $unset: { confirmationToken: 1 } });
    return user
  }

  public async logout(userData: User): Promise<User> {
    if (isEmptyObject(userData)) throw new HttpException(400, "Invalid user");

    const findUser: User = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, "User not found");

    return findUser;
  }

  public async updatePassword(user: User, oldPassword: string, newPassword: string): Promise<TokenData> {
    if (isNullOrEmpty(oldPassword) || isNullOrEmpty(newPassword)) {
      throw new HttpException(409, "Password can't be empty");
    }
    const isPasswordMatching: boolean = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatching) {
      throw new HttpException(409, 'Old Password is wrong!');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user = await this.users.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword
      }
    });
    const tokenData = this.createToken(user);
    return tokenData;
  }

  public async updateUser(userId: string, userData: User): Promise<TokenData> {
    if (isEmptyObject(userData)) throw new HttpException(400, "Missing user data");
    if (userId != userData._id) throw new HttpException(401, "Unauthorized");

    if (await this.users.exists({ $and: [{ email: userData.email }, { _id: { $ne: userId } }] })) {
      throw new HttpException(400, "Email already exists!");
    }

    if (userData.slug) {
      userData.slug = slugify(userData.slug);
    }

    if (await this.users.exists({ $and: [{ slug: userData.slug }, { _id: { $ne: userId } }] })) {
      throw new HttpException(400, "user url already exists!");
    }

    const user: User = await this.users.findByIdAndUpdate(userId, userData, { new: true }).select('-__v -password');
    if (!user) throw new HttpException(409, "User not found");

    const tokenData = this.createToken(user);
    return tokenData;
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id, profilePicture: user.profilePicture,
      fullName: user.fullName,
      role: user.role,
      language: user.language,
      slug: user.slug
    };
    const secret: string = process.env.JWT_SECRET;
    const expiresIn: number = 60 * 60 * 60;

    return { expiresIn, token: jwt.sign(dataStoredInToken, secret, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  private async sendEmail(emailAdress: string, content: string, subject: string): Promise<any> {
    var smtpConfig = {
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true, // use SSL
      requireTLS: true,
      auth: {
        user: 'contact@linkedfishers.com',
        pass: 'k~G`F]8.$x3Q79-K'
      },
      logger: true,
    };

    var transporter = nodemailer.createTransport(smtpConfig);
    var mailOptions = {
      from: 'contact@linkedfishers.com',
      to: emailAdress,
      subject: subject,
      html: content
    };
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("error is " + error);
          reject(error);
        }
        else {
          console.log('Email sent: ' + info.response);
          resolve(true);
        }
      });
    });
  }

  private async sendConfirmationEmail(user: User, url: string): Promise<any> {
    let html = `
    <center>
    <td>
    <table align="center" bgcolor="#FFFFFF" class="m_444611345908390707row" style="margin:0 auto">
        <tbody>
            <tr>
                <td class="m_444611345908390707spacer" colspan="2" height="30"
                    style="font-size:30px;line-height:30px;margin:0;padding:0">&nbsp;</td>
            </tr>

            <tr>
                <td class="m_444611345908390707spacer" colspan="2" height="30"
                    style="font-size:30px;line-height:30px;margin:0;padding:0">&nbsp;</td>
            </tr>
        </tbody>
    </table>

    <table align="center" bgcolor="#FFFFFF" class="m_444611345908390707row"
        style="word-break:break-all;border-spacing:0;margin:0 auto;border-top:1px solid #eeeeee">
        <tbody>
            <tr>
                <td class="m_444611345908390707spacer" colspan="2" height="30"
                    style="font-size:30px;line-height:30px;margin:0;padding:0" width="100%">&nbsp;</td>
            </tr>
            <tr class="m_444611345908390707mobile-full-width" style="vertical-align:top" valign="top">
                <th class="m_444611345908390707column m_444611345908390707mobile-last"
                    style="width:400px;padding:0;padding-left:30px;padding-right:30px;font-weight:400" width="400">
                    <table bgcolor="#FFFFFF" style="border-spacing:0;width:100%" width="100%">
                        <tbody>
                            <tr>
                                <th class="m_444611345908390707sans-serif" style="padding:0;text-align:left">
                                    <div class="m_444611345908390707sans-serif"
                                        style="color:rgb(150,154,161);font-weight:400;line-height:30px;margin:0;padding:0">


                                        <div style="margin-bottom:15px;font-size:15px;color:#747487">Hello <a
                                                href="mailto:${user.email}"
                                                style="color:#747487;text-decoration:none"
                                                target="_blank">${user.fullName}</a>,</div>
                                        <div style="margin-bottom:15px;font-size:15px;color:#747487">Welcome to Linked Fishers!
                                        <br>
                                        <center>
                                            <table bgcolor="#2D8CFF"
                                                style="border-spacing:0;border-radius:3px;margin:0 auto">
                                                <tbody>
                                                    <tr>
                                                        <td class="m_444611345908390707sans-serif" style="padding:0"><a
                                                                href="${url}"
                                                                style="border:0 solid #2d8cff;display:inline-block;font-size:14px;padding:15px 50px 15px 50px;text-align:center;font-weight:700;text-decoration:none;color:#ffffff"
                                                                target="_blank">
                                                                Activate Account</a></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </center>
                                        <table align="center" bgcolor="#FFFFFF" class="m_444611345908390707row"
                                            style="border-spacing:0;margin:0 auto">
                                            <tbody>
                                                <tr>
                                                    <td class="m_444611345908390707spacer" colspan="2" height="20"
                                                        style="font-size:20px;line-height:20px;margin:0;padding:0"
                                                        width="100%">&nbsp;</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div
                                            style="margin-bottom:15px;font-size:15px;color:#747487;word-break:break-all">
                                            Or paste this link into your browser:<br><a
                                                href="${url}"
                                                style="color:#2d8cff;font-weight:700;text-decoration:none"
                                                target="_blank">
                                                ${url}</a>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                        </tbody>
                    </table>
                </th>
            </tr>

        </tbody>
    </table>


</td>
</center>

    `
    return this.sendEmail(user.email, html, "Please activate your Linked Fishers account");
  }

  private async sendPasswordResetEmail(user: User, url: string): Promise<any> {
    let html = `
    <center>
    <td>
    <table align="center" bgcolor="#FFFFFF" class="m_444611345908390707row" style="margin:0 auto">
        <tbody>
            <tr>
                <td class="m_444611345908390707spacer" colspan="2" height="30"
                    style="font-size:30px;line-height:30px;margin:0;padding:0">&nbsp;</td>
            </tr>

            <tr>
                <td class="m_444611345908390707spacer" colspan="2" height="30"
                    style="font-size:30px;line-height:30px;margin:0;padding:0">&nbsp;</td>
            </tr>
        </tbody>
    </table>

    <table align="center" bgcolor="#FFFFFF" class="m_444611345908390707row"
        style="word-break:break-all;border-spacing:0;margin:0 auto;border-top:1px solid #eeeeee">
        <tbody>
            <tr>
                <td class="m_444611345908390707spacer" colspan="2" height="30"
                    style="font-size:30px;line-height:30px;margin:0;padding:0" width="100%">&nbsp;</td>
            </tr>
            <tr class="m_444611345908390707mobile-full-width" style="vertical-align:top" valign="top">
                <th class="m_444611345908390707column m_444611345908390707mobile-last"
                    style="width:400px;padding:0;padding-left:30px;padding-right:30px;font-weight:400" width="400">
                    <table bgcolor="#FFFFFF" style="border-spacing:0;width:100%" width="100%">
                        <tbody>
                            <tr>
                                <th class="m_444611345908390707sans-serif" style="padding:0;text-align:left">
                                    <div class="m_444611345908390707sans-serif"
                                        style="color:rgb(150,154,161);font-weight:400;line-height:30px;margin:0;padding:0">


                                        <div style="margin-bottom:15px;font-size:15px;color:#747487">Hello <a
                                                href="mailto:${user.email}"
                                                style="color:#747487;text-decoration:none"
                                                target="_blank">${user.fullName}</a>,</div>
                                        <div style="margin-bottom:15px;font-size:15px;color:#747487">We received a password reset request for your Linked Fishers account!
                                        <br>
                                        <center>
                                            <table bgcolor="#2D8CFF"
                                                style="border-spacing:0;border-radius:3px;margin:0 auto">
                                                <tbody>
                                                    <tr>
                                                        <td class="m_444611345908390707sans-serif" style="padding:0"><a
                                                                href="${url}"
                                                                style="border:0 solid #2d8cff;display:inline-block;font-size:14px;padding:15px 50px 15px 50px;text-align:center;font-weight:700;text-decoration:none;color:#ffffff"
                                                                target="_blank">
                                                                Reset password</a></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </center>
                                        <table align="center" bgcolor="#FFFFFF" class="m_444611345908390707row"
                                            style="border-spacing:0;margin:0 auto">
                                            <tbody>
                                                <tr>
                                                    <td class="m_444611345908390707spacer" colspan="2" height="20"
                                                        style="font-size:20px;line-height:20px;margin:0;padding:0"
                                                        width="100%">&nbsp;</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div
                                            style="margin-bottom:15px;font-size:15px;color:#747487;word-break:break-all">
                                            Or paste this link into your browser:<br><a
                                                href="${url}"
                                                style="color:#2d8cff;font-weight:700;text-decoration:none"
                                                target="_blank">
                                                ${url}</a>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                        </tbody>
                    </table>
                </th>
            </tr>

        </tbody>
    </table>


</td>
</center>

    `
    return this.sendEmail(user.email, html, "Password reset");
  }


}

export default AuthService;
