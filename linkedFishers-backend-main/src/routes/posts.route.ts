import { Router } from 'express';
import PostController from '../controllers/posts.controller';
import Route from '../interfaces/routes.interface';
import authMiddleware from '../middlewares/auth.middleware';
import shortid from 'shortid';
import multer from 'multer';
import fs from 'fs'

// SET STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let path: string;
    if (file.mimetype.includes('image')) {
      path = 'uploads/posts/pictures';
    }
    else if (file.mimetype.includes('video')) {
      path = 'uploads/posts/videos';
    }
    else {
      path = 'uploads/posts/other';
    }
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    cb(null, path);
  },
  filename: (req, file, cb) => {
    let a = file.originalname.split('.')
    cb(null, `${shortid.generate()}-${Date.now()}.${a[a.length - 1]}`)
  }
})
const uploadMiddleware = multer({ storage: storage });


class PostsRoute implements Route {
  public path = '/posts';
  public router = Router();
  public postController = new PostController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //posts
    this.router.post(`${this.path}/new`, authMiddleware, uploadMiddleware.single('file'), this.postController.createPost);
    this.router.get(`${this.path}/all`, authMiddleware, this.postController.findAllPosts);
    this.router.get(`${this.path}/all/:skip/:limit`, authMiddleware, this.postController.findPosts);
    this.router.get(`${this.path}/following`, authMiddleware, this.postController.findFollowingPosts);
    this.router.get(`${this.path}/post/:id`, authMiddleware, this.postController.findPostById);
    this.router.get(`${this.path}/user-posts/:id`, authMiddleware, this.postController.findPostsByUser);
    this.router.get(`${this.path}/user-posts/`, authMiddleware, this.postController.findPostsByUser);
    this.router.delete(`${this.path}/post/:id`, authMiddleware, this.postController.deletePost);
    this.router.put(`${this.path}/react/:postId`, authMiddleware, this.postController.reactToPost);

    //comments
    this.router.post(`${this.path}/comment/new`, authMiddleware, this.postController.createComment);
    this.router.get(`${this.path}/comments/:postId/:count`, authMiddleware, this.postController.findCommentsByPost);
    this.router.delete(`${this.path}/comment/:id`, authMiddleware, this.postController.deleteComment);

  }
}

export default PostsRoute;
