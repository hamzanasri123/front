export class User {
  _id: string;
  fullName: string;
  slug: string;
  email: string;
  phone: string;
  adress: string;
  birthDate: Date;
  sex: string;
  password: string;
  token: string;
  profilePicture: string;
  coverPicture: string;
  coverPictures: [string];
  description: string;
  language: string;
  job: string;
  facebook: string;
  instagram: string;
  website: string;
  youtube: string;
  following: any[];
  followers: any[];
  pictures: [string];
  country: string;
  wishList: any[];
  specialities: string[];
  role: string;
  activated: boolean;
  confirmationToken: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
}

export class Report {
  _id: string;
  content: string;
  author: User;
  receiver: User;
  createdAt: any;
  is_read: boolean;
  status: any;
}