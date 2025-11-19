'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, MessageCircle, Heart, Share2, TrendingUp, Award, Calendar, MapPin, Plus, Search, Filter, ThumbsUp, Reply, MoveHorizontal as MoreHorizontal, UserPlus, Star, Activity } from 'lucide-react';
import { mockCommunityPosts, mockUsers } from '@/lib/mockData';
import { CommunityPost, User } from '@/lib/mockData';

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'discussion' | 'achievement' | 'question' | 'event-share'>('discussion');

  const filterPosts = (posts: CommunityPost[]) => {
    return posts.filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = selectedFilter === 'all' || post.type === selectedFilter;
      
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'popular':
          return b.likes - a.likes;
        case 'discussed':
          return b.comments.length - a.comments.length;
        default:
          return 0;
      }
    });
  };

  const filteredPosts = filterPosts(mockCommunityPosts);

  const stats = [
    { title: 'Community Members', value: '1,247', icon: Users, trend: '+89 this month' },
    { title: 'Active Discussions', value: '156', icon: MessageCircle, trend: '+23 this week' },
    { title: 'Events Shared', value: '89', icon: Calendar, trend: '+12 today' },
    { title: 'Achievements', value: '234', icon: Award, trend: '+45 this month' }
  ];

  const getPostTypeColor = (type: string) => {
    const colors = {
      'discussion': 'bg-blue-100 text-blue-800',
      'achievement': 'bg-green-100 text-green-800',
      'question': 'bg-yellow-100 text-yellow-800',
      'event-share': 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPostTypeIcon = (type: string) => {
    const icons = {
      'discussion': MessageCircle,
      'achievement': Award,
      'question': Users,
      'event-share': Calendar
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

  const PostCard = ({ post }: { post: CommunityPost }) => {
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
                <Badge variant="secondary" className="text-xs">
                  {post.author.type}
                </Badge>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{formatTimeAgo(post.timestamp)}</span>
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
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">{post.content}</p>
            
            {post.image && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt="Post image"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                  <Heart className="h-4 w-4 mr-1" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments.length}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
              <Button variant="ghost" size="sm">
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            </div>
            
            {post.comments.length > 0 && (
              <div className="space-y-3 pt-3 border-t bg-gray-50 -mx-6 px-6 py-4">
                {post.comments.slice(0, 2).map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                      <AvatarFallback className="text-xs">
                        {comment.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {post.comments.length > 2 && (
                  <Button variant="ghost" size="sm" className="text-primary">
                    View all {post.comments.length} comments
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const MemberCard = ({ user }: { user: User }) => (
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
            <p className="text-sm text-gray-500 capitalize">{user.type}</p>
            <p className="text-xs text-gray-400">{user.location}</p>
          </div>
          <Button size="sm" variant="outline">
            <UserPlus className="h-4 w-4 mr-1" />
            Connect
          </Button>
        </div>
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2">Interests</div>
          <div className="flex flex-wrap gap-1">
            {user.preferences?.slice(0, 3).map((sport, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {sport}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community</h1>
            <p className="text-gray-600 mt-1">
              Connect, share, and engage with fellow sports enthusiasts
            </p>
          </div>
          <Dialog>
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
                <Select value={newPostType} onValueChange={(value: any) => setNewPostType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Post Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="event-share">Event Share</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Post</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
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
                      <SelectItem value="achievement">Achievements</SelectItem>
                      <SelectItem value="question">Questions</SelectItem>
                      <SelectItem value="event-share">Event Shares</SelectItem>
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
                  
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600 text-center mb-4">
                      Try adjusting your filters or be the first to start a conversation!
                    </p>
                    <Button>Create Post</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Members */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Members</CardTitle>
                <CardDescription>Connect with fellow sports enthusiasts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockUsers.slice(0, 4).map((user) => (
                  <MemberCard key={user.id} user={user} />
                ))}
                <Button variant="outline" className="w-full">
                  View All Members
                </Button>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { tag: 'basketball', posts: 23 },
                  { tag: 'community', posts: 18 },
                  { tag: 'running', posts: 15 },
                  { tag: 'yoga', posts: 12 },
                  { tag: 'tournament', posts: 9 }
                ].map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">#{topic.tag}</span>
                    </div>
                    <span className="text-xs text-gray-500">{topic.posts} posts</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Find Events
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Join Groups
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Leave Review
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Track Progress
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}