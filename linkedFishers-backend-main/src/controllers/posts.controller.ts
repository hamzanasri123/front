import { NextFunction, Response } from 'express';
import { RequestWithFile, RequestWithUser } from '../interfaces/auth.interface';
import { Comment, Post } from '../interfaces/posts.interface';
import { User } from '../interfaces/users.interface';
import PostService from '../services/posts.services';

class PostController {
    public postService = new PostService();

    public createPost = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const postData = req.body;
            postData.author = user;
            if (req.file) {
                postData.attachment = req.file.path.split('/').splice(1).join('/');
                postData.attachmentType = req.file.mimetype.split('/')[0];
            }
            const post: Post = await this.postService.createPost(postData);
            res.status(201).json({ data: post, message: 'Created post' });
        } catch (error) {
            next(error);
        }
    };

    public createComment = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const commentData = req.body;
            commentData.author = user._id;
            const comment: Comment = await this.postService.createComment(commentData);
            res.status(201).json({ data: comment, message: 'Created comment' });
        } catch (error) {
            next(error);
        }
    };

    public findAllPosts = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const posts: Post[] = await this.postService.findAllPosts();
            res.status(200).json({ data: posts });
        } catch (error) {
            next(error);
        }
    }

    public findFollowingPosts = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { posts, total } = await this.postService.findFollowingPosts(req.user);
            res.status(200).json({ data: posts, total });
        } catch (error) {
            next(error);
        }
    }

    public findPosts = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {

            let skip = Number(req.params.skip) || 0;
            let limit = Number(req.params.limit) || 5;
            const { posts, total } = await this.postService.findPosts(skip, limit);

            res.status(200).json({ data: posts, total });
        } catch (error) {
            next(error);
        }
    }
    public findPostsByUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authorId = req.params.id || req.user._id;
            const posts: Post[] = await this.postService.findPostsByUser(authorId);
            res.status(200).json({ data: posts });
        } catch (error) {
            next(error);
        }
    }
    public findPostById = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const post: Post = await this.postService.findPostById(req.params.id);
            res.status(200).json({ data: post });
        } catch (error) {
            next(error);
        }
    }
    public deletePost = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const author: User = req.user;
            const post: Post = await this.postService.deletePost(req.params.id, author);
            res.status(200).json({ data: post });
        } catch (error) {
            next(error);
        }
    }

    public findCommentsByPost = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const count: number = Number(req.params.count) || 0;
            const comments: Comment[] = await this.postService.findCommentsByPost(req.params.postId, count);
            res.status(200).json({ data: comments });
        } catch (error) {
            next(error);
        }
    }

    public deleteComment = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const author: User = req.user;
            const comment: Comment = await this.postService.deleteComment(req.params.id, author);
            res.status(200).json({ data: comment });
        } catch (error) {
            next(error);
        }
    }

    public reactToPost = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const reactionData = req.body;
            reactionData.author = user._id;
            reactionData.postId = req.params.postId;
            const post: Post = await this.postService.reactToPost(reactionData);
            res.status(201).json({ data: post, message: 'Added reaction' });
        } catch (error) {
            next(error);
        }
    };
}

export default PostController;
