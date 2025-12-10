'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, MessageCircle, Heart, TrendingUp, Award, Calendar, Plus, Search, ThumbsUp, MoreVertical, Star, Loader2, Trash2 } from 'lucide-react';
import { 
  communityService, 
  CommunityPost, 
  ActiveMember, 
  TrendingTopic,
  PostType,
  SortBy,
  CommunityStats
} from '@/services/community.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// PostCard component defined outside to prevent re-creation on every render
interface PostCardProps {
  post: CommunityPost;
  user: any;
  showCommentInput: string | null;
  commentText: { [key: string]: string };
  isSubmittingComment: boolean;
  showReplyInput: string | null;
  replyText: { [key: string]: string };
  showAllComments: { [key: string]: boolean };
  onTogglePostLike: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onToggleCommentInput: (postId: string) => void;
  onSubmitComment: (postId: string) => void;
  onSetCommentText: (postId: string, text: string) => void;
  onSetShowCommentInput: (postId: string | null) => void;
  onToggleCommentLike: (commentId: string, postId: string) => void;
  onToggleReplyInput: (commentId: string) => void;
  onSubmitReply: (postId: string, commentId: string) => void;
  onSetReplyText: (commentId: string, text: string) => void;
  onSetShowReplyInput: (commentId: string | null) => void;
  onSetShowAllComments: (postId: string, show: boolean) => void;
}

const PostCard = ({ 
  post, 
  user,
  showCommentInput,
  commentText,
  isSubmittingComment,
  showReplyInput,
  replyText,
  showAllComments,
  onTogglePostLike,
  onDeletePost,
  onToggleCommentInput,
  onSubmitComment,
  onSetCommentText,
  onSetShowCommentInput,
  onToggleCommentLike,
  onToggleReplyInput,
  onSubmitReply,
  onSetReplyText,
  onSetShowReplyInput,
  onSetShowAllComments,
}: PostCardProps) => {
  const getPostTypeColor = (type: string) => {
    const colors = {
      'discussion': 'bg-blue-100 text-blue-800',
      'question': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPostTypeIcon = (type: string) => {
    const icons = {
      'discussion': MessageCircle,
      'question': Users
    };
    return icons[type as keyof typeof icons] || MessageCircle;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const PostTypeIcon = getPostTypeIcon(post.type);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>
              {post.author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{post.author.name}</h4>
              <Badge variant="secondary" className="text-xs capitalize">
                {post.author.role.toLowerCase()}
              </Badge>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatTimeAgo(new Date(post.createdAt))}</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`text-xs ${getPostTypeColor(post.type)}`}>
                <PostTypeIcon className="h-3 w-3 mr-1" />
                {post.type.replace('-', ' ')}
              </Badge>
              {post.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
          {user?.id === post.author.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDeletePost(post.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">{post.content}</p>
          
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt="Post image"
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-red-600"
                onClick={() => onTogglePostLike(post.id)}
              >
                <Heart className="h-4 w-4 mr-1" />
                {post.likes}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-blue-600"
                onClick={() => onToggleCommentInput(post.id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {post._count?.comments || post.comments.length}
              </Button>
            </div>
          </div>
          
          {/* Comment Input Section */}
          {showCommentInput === post.id && (
            <div className="pt-4 border-t mt-4">
              <div className="flex space-x-3">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText[post.id] || ''}
                  onChange={(e) => onSetCommentText(post.id, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSetShowCommentInput(null)}
                  disabled={isSubmittingComment}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onSubmitComment(post.id)}
                  disabled={isSubmittingComment || !commentText[post.id]?.trim()}
                >
                  {isSubmittingComment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Comment'
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {post.comments.length > 0 && (
            <div className="space-y-3 pt-3 border-t bg-gray-50 -mx-6 px-6 py-4">
              {(showAllComments[post.id] ? post.comments : post.comments.slice(0, 2)).map((comment) => (
                <div key={comment.id}>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                      <AvatarFallback className="text-xs">
                        {comment.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(new Date(comment.createdAt))}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-6 px-2 hover:text-red-600"
                          onClick={() => onToggleCommentLike(comment.id, post.id)}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-6 px-2 hover:text-blue-600"
                          onClick={() => onToggleReplyInput(comment.id)}
                        >
                          Reply
                        </Button>
                      </div>
                      
                      {/* Reply Input for Comment */}
                      {showReplyInput === comment.id && (
                        <div className="mt-3 ml-4">
                          <Textarea
                            placeholder="Write a reply..."
                            value={replyText[comment.id] || ''}
                            onChange={(e) => onSetReplyText(comment.id, e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onSetShowReplyInput(null)}
                              disabled={isSubmittingComment}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => onSubmitReply(post.id, comment.id)}
                              disabled={isSubmittingComment || !replyText[comment.id]?.trim()}
                            >
                              {isSubmittingComment ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                'Reply'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {post.comments.length > 2 && !showAllComments[post.id] && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => onSetShowAllComments(post.id, true)}
                >
                  View all {post._count?.comments || post.comments.length} comments
                </Button>
              )}
              {post.comments.length > 2 && showAllComments[post.id] && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => onSetShowAllComments(post.id, false)}
                >
                  Show less
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// MemberCard component defined outside to prevent re-creation on every render
const MemberCard = ({ user }: { user: ActiveMember }) => {
  const preferences = user.preferences ? 
    (Array.isArray(user.preferences) ? user.preferences : []) : [];
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
            <p className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</p>
            {user.location && <p className="text-xs text-gray-400">{user.location}</p>}
          </div>
        </div>
        {preferences.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-2">Interests</div>
            <div className="flex flex-wrap gap-1">
              {preferences.slice(0, 3).map((sport: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {sport}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function CommunityPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | PostType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('discussion');
  const [newPostTags, setNewPostTags] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Data state
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  
  // Loading states
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Comment/Reply states
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showAllComments, setShowAllComments] = useState<{ [key: string]: boolean }>({});

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await communityService.getPosts({
        type: selectedFilter === 'all' ? undefined : selectedFilter,
        search: searchTerm || undefined,
        sortBy,
      });
      
      if (response.data) {
        setPosts(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await communityService.getCommunityStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch active members
  const fetchActiveMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await communityService.getActiveMembers(4);
      if (response.data) {
        setActiveMembers(response.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch trending topics
  const fetchTrendingTopics = async () => {
    try {
      setIsLoadingTopics(true);
      const response = await communityService.getTrendingTopics(5);
      if (response.data) {
        setTrendingTopics(response.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Create post
  const handleCreatePost = async () => {

    if (!newPostContent.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide content for your post.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreatingPost(true);
      const tags = newPostTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await communityService.createPost({
        content: newPostContent,
        type: newPostType,
        tags,
      });

      toast({
        title: 'Success',
        description: 'Post created successfully!',
      });

      setNewPostContent('');
      setNewPostTags('');
      setNewPostType('discussion');
      setIsDialogOpen(false);
      
      // Refresh posts
      fetchPosts();
      fetchStats();
      fetchTrendingTopics();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Toggle post like
  const handleTogglePostLike = async (postId: string) => {
    try {
      const response = await communityService.togglePostLike(postId);
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: response.data.liked ? post.likes + 1 : post.likes - 1 }
            : post
        )
      );
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    try {
      await communityService.deletePost(postId);
      
      // Remove post from local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      toast({
        title: 'Success',
        description: 'Post deleted successfully!',
      });
      
      // Refresh stats
      fetchStats();
      fetchTrendingTopics();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Toggle comment input visibility
  const handleToggleCommentInput = (postId: string) => {
    if (showCommentInput === postId) {
      setShowCommentInput(null);
    } else {
      setShowCommentInput(postId);
    }
  };

  // Submit comment
  const handleSubmitComment = async (postId: string) => {
    const content = commentText[postId]?.trim();
    
    if (!content) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a comment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmittingComment(true);
      const response = await communityService.createComment({
        postId,
        content,
      });

      // Update local state with new comment
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [response.data, ...post.comments],
              _count: {
                ...post._count,
                comments: (post._count?.comments || post.comments.length) + 1,
              },
            };
          }
          return post;
        })
      );

      // Clear comment text and hide input
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      setShowCommentInput(null);

      toast({
        title: 'Success',
        description: 'Comment posted successfully!',
      });
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };


  // Toggle comment like
  const handleToggleCommentLike = async (commentId: string, postId: string) => {
    try {
      const response = await communityService.toggleCommentLike(commentId);
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, likes: response.data.liked ? comment.likes + 1 : comment.likes - 1 }
                  : comment
              ),
            };
          }
          return post;
        })
      );
    } catch (error: any) {
      console.error('Error toggling comment like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Toggle reply input for comments
  const handleToggleReplyInput = (commentId: string) => {
    if (showReplyInput === commentId) {
      setShowReplyInput(null);
    } else {
      setShowReplyInput(commentId);
    }
  };

  // Submit reply to comment (using same comment creation endpoint)
  const handleSubmitReply = async (postId: string, commentId: string) => {
    const content = replyText[commentId]?.trim();
    
    if (!content) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a reply.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmittingComment(true);
      const response = await communityService.createComment({
        postId,
        content: content,
      });

      // Update local state with new comment
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [response.data, ...post.comments],
              _count: {
                ...post._count,
                comments: (post._count?.comments || post.comments.length) + 1,
              },
            };
          }
          return post;
        })
      );

      // Clear reply text and hide input
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      setShowReplyInput(null);

      toast({
        title: 'Success',
        description: 'Reply posted successfully!',
      });
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts();
    fetchStats();
    fetchActiveMembers();
    fetchTrendingTopics();
  }, []);

  // Refetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [selectedFilter, sortBy, searchTerm]);

  // Calculate stats
  const totalPosts = stats?.posts?.total || 0;
  const totalQuestions = stats?.questions?.total || 0;
  const totalDiscussions = stats?.discussions?.total || 0;
  
  const statsArray = stats
    ? [
        { title: 'Community Members', value: stats.members.total.toString(), icon: Users, trend: stats.members.trend, iconColor: 'text-blue-500' },
        { title: 'Active Discussions', value: totalDiscussions.toString(), icon: MessageCircle, trend: stats.discussions.trend, iconColor: 'text-black' },
        { title: 'Posts Created', value: totalPosts.toString(), icon: Calendar, trend: stats.posts.trend, iconColor: 'text-purple-500' },
        { title: 'Active Questions', value: totalQuestions.toString(), icon: Award, trend: stats.questions.trend, iconColor: 'text-green-500' },
      ]
    : [];


  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">
              Connect and engage with fellow sports enthusiasts
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Share your thoughts, achievements, or questions with the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newPostType} onValueChange={(value: PostType) => setNewPostType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Post Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <Input
                  placeholder="Tags (optional, comma-separated, e.g., basketball, community, running)"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreatingPost}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={isCreatingPost}
                  >
                    {isCreatingPost ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingStats ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : (
            statsArray.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor || 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Posts Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Posts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="discussion">Discussions</SelectItem>
                      <SelectItem value="question">Questions</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="discussed">Most Discussed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-6">
              {isLoadingPosts ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    user={user}
                    showCommentInput={showCommentInput}
                    commentText={commentText}
                    isSubmittingComment={isSubmittingComment}
                    showReplyInput={showReplyInput}
                    replyText={replyText}
                    showAllComments={showAllComments}
                    onTogglePostLike={handleTogglePostLike}
                    onDeletePost={handleDeletePost}
                    onToggleCommentInput={handleToggleCommentInput}
                    onSubmitComment={handleSubmitComment}
                    onSetCommentText={(postId, text) => setCommentText(prev => ({ ...prev, [postId]: text }))}
                    onSetShowCommentInput={setShowCommentInput}
                    onToggleCommentLike={handleToggleCommentLike}
                    onToggleReplyInput={handleToggleReplyInput}
                    onSubmitReply={handleSubmitReply}
                    onSetReplyText={(commentId, text) => setReplyText(prev => ({ ...prev, [commentId]: text }))}
                    onSetShowReplyInput={setShowReplyInput}
                    onSetShowAllComments={(postId, show) => setShowAllComments(prev => ({ ...prev, [postId]: show }))}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Try adjusting your filters or be the first to start a conversation!
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>Create Post</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 
             */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Members</CardTitle>
                <CardDescription>Connect with fellow sports enthusiasts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingMembers ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : activeMembers.length > 0 ? (
                  <>
                    {activeMembers.map((member) => (
                      <MemberCard key={member.id} user={member} />
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No active members to display
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingTopics ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))
                ) : trendingTopics.length > 0 ? (
                  trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm font-medium">#{topic.tag}</span>
                      </div>
                      <span className="text-xs text-gray-500">{topic.posts} posts</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No trending topics yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/events')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Find Events
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/reviews')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Leave Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}