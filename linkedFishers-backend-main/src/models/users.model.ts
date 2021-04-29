import mongoose from 'mongoose';
import { User } from '../interfaces/users.interface';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: "Full name can't be empty"
  },
  email: String,
  slug: {
    type: String,
    unique: true,
    index: {
      unique: true,
      partialFilterExpression: { slug: { $type: "string" } }
    }
  },
  phone: {
    type: String,
    index: {
      unique: true,
      partialFilterExpression: { phone: { $type: "string" } }
    }
  },
  adress: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  sex: { type: String, enum: ['male', 'female', 'other'] },
  profilePicture: {
    type: String,
    default: "profilePictures/default-profile.png"
  },
  coverPictures: [{ type: String }],
  pictures: [{ type: String }],
  specialities: [{ type: String }],
  description: { type: String },
  language: { type: String, default: 'en' },
  job: { type: String },
  password: String,
  facebook: { type: String },
  instagram: { type: String },
  website: { type: String },
  youtube: { type: String },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  role: { type: String, default: "user" },
  resetPasswordToken: String,
  confirmationToken: String,
  resetPasswordExpires: Date,
  country: String,
  activated: Boolean,
  wishList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hebergement' }]
});

userSchema.set('timestamps', true);


const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default userModel;