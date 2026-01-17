import { gql } from "../gql/gql";

export const GET_GROUPS = gql(`
  query GetGroups($limit: Int, $offset: Int, $ownerId: ID, $type: GroupType) {
    groups(limit: $limit, offset: $offset, ownerId: $ownerId, type: $type) {
      id
      name
      description
      slug
      type
      membersCount
      isMember
      createdAt
      owner {
        id
        name
        username
        avatar
      }
    }
  }
`);

export const GET_GROUP_BY_SLUG = gql(`
  query GetGroupBySlug($slug: String!, $postLimit: Int, $postOffset: Int) {
    group(slug: $slug) {
      id
      name
      description
      icon
      slug
      type
      membersCount
      isMember
      createdAt
      owner {
        id
        name
        username
        avatar
      }
      posts(limit: $postLimit, offset: $postOffset) {
        id
        title
        content
        createdAt
        commentsCount
        upvotes
        downvotes
        userVote
        author {
          id
          name
          username
          avatar
        }
      }
    }
  }
`);

export const CREATE_GROUP = gql(`
  mutation CreateGroup($input: NewGroup!) {
    createGroup(input: $input) {
      id
      name
      slug
      type
    }
  }
`);

export const JOIN_GROUP = gql(`
  mutation JoinGroup($groupId: ID!) {
    joinGroup(groupId: $groupId)
  }
`);

export const LEAVE_GROUP = gql(`
  mutation LeaveGroup($groupId: ID!) {
    leaveGroup(groupId: $groupId)
  }
`);

export const DELETE_GROUP = gql(`
  mutation DeleteGroup($groupId: ID!) {
    deleteGroup(groupId: $groupId)
  }
`);

export const UPDATE_GROUP = gql(`
  mutation UpdateGroup($groupId: ID!, $name: String, $description: String, $icon: String) {
    updateGroup(groupId: $groupId, name: $name, description: $description, icon: $icon) {
      id
      name
      description
      icon
      slug
    }
  }
`);

export const CREATE_POST = gql(`
  mutation CreatePost($input: NewPost!) {
    createPost(input: $input) {
      id
      title
      content
      createdAt
      author {
        id
        name
        username
        avatar
      }
    }
  }
`);

export const GET_DISCUSSION = gql(`
  query GetDiscussion($groupId: ID!) {
    discussion(groupId: $groupId) {
      id
      channels {
        id
        name
        type
      }
    }
  }
`);

export const GET_CHANNEL_MESSAGES = gql(`
  query GetChannelMessages($channelId: ID!, $limit: Int, $offset: Int) {
    channel(id: $channelId) {
      id
      name
      type
      messages(limit: $limit, offset: $offset) {
        id
        content
        createdAt
        sender {
          id
          name
          username
          avatar
        }
      }
    }
  }
`);

export const SEND_MESSAGE = gql(`
  mutation SendMessage($input: NewMessage!) {
    sendMessage(input: $input) {
      id
      content
      createdAt
      sender {
        id
        name
        username
        avatar
      }
    }
  }
`);

export const CREATE_CHANNEL = gql(`
  mutation CreateChannel($input: NewChannel!) {
    createChannel(input: $input) {
      id
      name
      type
    }
  }
`);

export const GET_POST = gql(`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      createdAt
      commentsCount
      upvotes
      downvotes
      userVote
      author {
        id
        name
        username
        avatar
      }
      group {
        id
        name
        slug
      }
      comments(limit: 20, offset: 0) {
        id
        content
        createdAt
        upvotes
        downvotes
        userVote
        repliesCount
        author {
          id
          name
          username
          avatar
        }
      }
    }
  }
`);

export const CREATE_COMMENT = gql(`
  mutation CreateComment($input: NewComment!) {
    createComment(input: $input) {
      id
      content
      createdAt
      author {
        id
        name
        username
        avatar
      }
    }
  }
`);

export const VOTE_POST = gql(`
  mutation VotePost($postId: ID!, $type: VoteType!) {
    votePost(postId: $postId, type: $type) {
      id
      upvotes
      downvotes
      userVote
    }
  }
`);

export const VOTE_COMMENT = gql(`
  mutation VoteComment($commentId: ID!, $type: VoteType!) {
    voteComment(commentId: $commentId, type: $type) {
      id
      upvotes
      downvotes
      userVote
    }
  }
`);

export const GET_COMMENTS = gql(`
  query GetComments($postId: ID!, $limit: Int!, $offset: Int!) {
    post(id: $postId) {
      comments(limit: $limit, offset: $offset) {
        id
        content
        createdAt
        upvotes
        downvotes
        userVote
        repliesCount
        author {
          id
          name
          username
          avatar
        }
      }
    }
  }
`);

export const GET_REPLIES = gql(`
  query GetReplies($commentId: ID!, $limit: Int!, $offset: Int!) {
    comment(id: $commentId) {
      replies(limit: $limit, offset: $offset) {
        id
        content
        createdAt
        upvotes
        downvotes
        userVote
        repliesCount
        author {
          id
          name
          username
          avatar
        }
      }
    }
  }
`);

export const GET_PUBLIC_POSTS = gql(`
  query GetPublicPosts($limit: Int, $offset: Int) {
    publicPosts(limit: $limit, offset: $offset) {
      id
      title
      content
      createdAt
      commentsCount
      upvotes
      downvotes
      userVote
      author {
        id
        name
        username
        avatar
      }
      group {
        id
        name
        slug
        type
      }
    }
  }
`);

export const UPLOAD_USER_IMAGE_MUTATION = gql(`
  mutation UploadUserImage($file: Upload!) {
    uploadUserImage(file: $file)
  }
`);
