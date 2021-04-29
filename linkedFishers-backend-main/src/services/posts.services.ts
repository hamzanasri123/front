import { isValidObjectId } from 'mongoose';
import HttpException from '../exceptions/HttpException';
import { Comment, Notification, Post } from '../interfaces/posts.interface';
import { User } from '../interfaces/users.interface';
import commentModel from '../models/comments.model';
import postModel from '../models/posts.model';
import userModel from '../models/users.model';
import notificationModel from '../models/notifications.model';
import { isEmptyObject, isNullOrEmpty } from '../utils/util';

class PostService {

    public async createPost(postData): Promise<Post> {
        if (isEmptyObject(postData)) throw new HttpException(400, "Can't create empty post");
        if (!postData.attachment) {
            let videoId = this.getYoutubeId(postData.content);
            if (videoId) {
                postData.attachmentType = "youtube";
                postData.attachment = videoId;
            }
        }
        else if (postData.attachmentType === 'image') {
            await userModel.findByIdAndUpdate(postData.author._id, {
                $addToSet: {
                    pictures: postData.attachment
                }
            })
        }
        postData.comments = 0;
        let post = new postModel(postData);
        return await post.save();
    }

    public async createComment(commentData): Promise<Comment> {
        if (isEmptyObject(commentData)) throw new HttpException(400, "Can't create empty comment");
        const post: Post = await postModel.findByIdAndUpdate(commentData.post, {
            $inc: {
                comments: 1
            }
        });
        if (!post) {
            throw new HttpException(400, "Post not found");
        }

        let comment = new commentModel(commentData);
        comment = await comment.save();
        let sender = await userModel.findById(commentData.author);

        let notificationData = new Notification();
        notificationData.sender = sender;
        notificationData.receiver = post.author;
        notificationData.type = "commented_post";
        notificationData.targetId = commentData.post;
        let notification = new notificationModel(notificationData);
        await notification.save();
        return comment;
    }

    public async findAllPosts(): Promise<Post[]> {
        const posts: Post[] = await postModel.find()
            .sort('-createdAt')
            .populate('author', '_id fullName profilePicture slug')
            .populate({ path: 'reacts', populate: { path: 'author', model: 'User', select: 'fullName' } });
        return posts;
    }
    //  await Post.find().sort('-createdAt').skip(skip).limit(limit).populate('authorId equipments').exec();

    public async findPosts(skip: number, limit: number): Promise<{ posts: Post[], total: number }> {
        const posts: Post[] = await postModel.find().sort('-createdAt').skip(skip).limit(limit);
        const total = await postModel.countDocuments();
        return { posts, total };
    }

    public async findPostsByUser(authorId: string): Promise<Post[]> {
        if (!isValidObjectId(authorId)) {
            throw new HttpException(400, "Invalid user id");
        }
        const author: User = await userModel.findById(authorId);
        if (!author) {
            return [];
        }
        const posts: Post[] = await postModel.find({ author: author })
            .sort('-createdAt')
            .populate('author', '_id fullName profilePicture slug')
            .populate({ path: 'reacts', populate: { path: 'author', model: 'User', select: 'fullName' } });
        return posts;
    }

    public async findPostById(id: string): Promise<Post> {
        const post: Post = await postModel.findById(id);
        return post;
    }

    public async findFollowingPosts(user: User, skip?: number, limit?: number): Promise<{ posts: Post[], total: number }> {
        user.following.push(user._id);
        const posts: Post[] = await postModel.find({
            author: { $in: user.following }
        })
            .sort('-createdAt')
            .populate('author', '_id fullName profilePicture slug')
            .populate({ path: 'reacts', populate: { path: 'author', model: 'User', select: 'fullName' } });
        const total = await postModel.countDocuments();
        return { posts, total };
    }

    public async deletePost(postId: string, author: User): Promise<Post> {
        const post: Post = await postModel.findOneAndDelete({
            _id: postId, author
        });
        return post;
    }

    public async deleteComment(commentId: string, author: User): Promise<Comment> {
        const comment: Comment = await commentModel.findOneAndDelete({
            _id: commentId,
            author
        });
        return comment;
    }

    public async findCommentsByPost(id: string, count: number): Promise<Comment[]> {
        const comments: Comment[] = await commentModel
            .find({ post: id })
            .sort('-createdAt')
            .limit(count)
            .populate('author', '_id fullName profilePicture')
        return comments;
    }

    public async reactToPost(reactionData): Promise<Post> {
        if (isEmptyObject(reactionData) || !isValidObjectId(reactionData.postId)) {
            throw new HttpException(400, "Cannot create reaction");
        }
        let post: Post = await postModel.findByIdAndUpdate(reactionData.postId,
            { $pull: { reacts: { author: reactionData.author } } },
            { new: true }
        );
        if (isNullOrEmpty(reactionData.reactType)) {
            return post;
        }
        post = await postModel.findByIdAndUpdate(reactionData.postId,
            { $addToSet: { reacts: { author: reactionData.author, reactType: reactionData.reactType } } },
            { new: true }
        );
        let sender = await userModel.findById(reactionData.author);
        let notificationData = new Notification();
        notificationData.sender = sender;
        notificationData.receiver = post.author;
        notificationData.type = "liked_post";
        notificationData.content = "Liked your post";
        notificationData.targetId = reactionData.postId;
        let notification = new notificationModel(notificationData);
        await notification.save();
        return post;
    }

    private getYoutubeId(url: string) {
        if (!url) return false;
        let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        let match = url.match(regExp);
        if (!match) return false;
        if (match[2].length == 11) {
            return match[2];
        }
        else return match[2].split(" ")[0];
    }
}

export default PostService;
