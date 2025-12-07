import { PrismaClient, PostType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePostDto {
  content: string;
  type: PostType;
  authorId: string;
  tags: string[];
  imageUrl?: string;
}

export interface CreateCommentDto {
  content: string;
  authorId: string;
  postId: string;
}

export class CommunityRepository {
  // Posts
  async createPost(data: CreatePostDto) {
    return prisma.communityPost.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            role: true,
            preferences: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async getAllPosts(filters?: {
    type?: PostType;
    authorId?: string;
    search?: string;
    sortBy?: 'recent' | 'popular' | 'discussed';
    limit?: number;
    offset?: number;
  }) {
    const {
      type,
      authorId,
      search,
      sortBy = 'recent',
      limit = 50,
      offset = 0,
    } = filters || {};

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    
    if (sortBy === 'popular') {
      orderBy = { likes: 'desc' };
    } else if (sortBy === 'discussed') {
      orderBy = { comments: { _count: 'desc' } };
    }

    return prisma.communityPost.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            role: true,
            preferences: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Limit comments per post
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async getPostById(id: string) {
    return prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            role: true,
            preferences: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
  }

  async updatePost(id: string, content: string) {
    return prisma.communityPost.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            location: true,
            role: true,
          },
        },
      },
    });
  }

  async deletePost(id: string) {
    return prisma.communityPost.delete({
      where: { id },
    });
  }

  // Comments
  async createComment(data: CreateCommentDto) {
    return prisma.postComment.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }

  async getCommentsByPostId(postId: string) {
    return prisma.postComment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteComment(id: string) {
    return prisma.postComment.delete({
      where: { id },
    });
  }

  // Likes
  async togglePostLike(userId: string, postId: string) {
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      // Like
      await prisma.postLike.create({
        data: { userId, postId },
      });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  async toggleCommentLike(userId: string, commentId: string) {
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });
      await prisma.postComment.update({
        where: { id: commentId },
        data: { likes: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      // Like
      await prisma.commentLike.create({
        data: { userId, commentId },
      });
      await prisma.postComment.update({
        where: { id: commentId },
        data: { likes: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  // Stats
  async getCommunityStats() {
    const [totalMembers, totalPosts, totalQuestions, totalDiscussions] = await Promise.all([
      prisma.user.count(),
      prisma.communityPost.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.communityPost.count({
        where: {
          type: 'QUESTION',
          createdAt: {
            gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.communityPost.count({
        where: {
          type: 'DISCUSSION',
          createdAt: {
            gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      totalMembers,
      activePosts: totalPosts,
      questions: totalQuestions,
      discussions: totalDiscussions,
    };
  }

  // Active Members
  async getActiveMembers(limit = 10) {
    return prisma.user.findMany({
      where: {
        OR: [
          {
            communityPosts: {
              some: {
                createdAt: {
                  gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
          {
            postComments: {
              some: {
                createdAt: {
                  gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        location: true,
        role: true,
        preferences: true,
        _count: {
          select: {
            communityPosts: true,
            postComments: true,
          },
        },
      },
      orderBy: {
        communityPosts: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  // Trending Topics
  async getTrendingTopics(limit = 10) {
    const posts = await prisma.communityPost.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        tags: true,
      },
    });

    // Count tag occurrences
    const tagCounts: { [key: string]: number } = {};
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert to array and sort
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, posts]) => ({ tag, posts }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, limit);

    return sortedTags;
  }
}

