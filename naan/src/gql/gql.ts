/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n        mutation SignIn($input: NewUser!) {\n          signIn(input: $input)\n        }\n          ": typeof types.SignInDocument,
    "\n            query GetCurrentUser {\n              me {\n                id\n                username\n                displayName\n                setupComplete\n                isAdmin\n              }\n            }\n          ": typeof types.GetCurrentUserDocument,
    "\n  mutation CompleteSetup($input: CompleteSetupInput!) {\n    completeSetup(input: $input)\n  }\n": typeof types.CompleteSetupDocument,
    "\n  query CheckUsername($username: String!) {\n    checkUsername(username: $username)\n  }\n": typeof types.CheckUsernameDocument,
    "\n  query GetArticleBySlug($slug: String!) {\n    articleBySlug(slug: $slug) {\n      id\n      title\n      slug\n      content\n      category\n      thumbnail\n      createdAt\n      updatedAt\n      description\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": typeof types.GetArticleBySlugDocument,
    "\n  query GetGroups($limit: Int, $offset: Int) {\n    publicGroups(limit: $limit, offset: $offset) {\n      id\n      name\n      description\n      slug\n      type\n      membersCount\n      isMember\n      createdAt\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": typeof types.GetGroupsDocument,
    "\n  query GetMyGroups {\n    myGroups {\n      id\n      name\n      slug\n      membersCount\n      icon\n    }\n  }\n": typeof types.GetMyGroupsDocument,
    "\n  query GetGroupBySlug($slug: String!, $postLimit: Int, $postOffset: Int) {\n    group(slug: $slug) {\n      id\n      name\n      description\n      icon\n      slug\n      type\n      membersCount\n      isMember\n      createdAt\n      inviteToken\n      joinRequests {\n        id\n        name\n        username\n        avatar\n      }\n      members {\n        id\n        name\n        username\n        avatar\n      }\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n      posts(limit: $postLimit, offset: $postOffset) {\n        id\n        title\n        content\n        createdAt\n        commentsCount\n        upvotes\n        downvotes\n        userVote\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": typeof types.GetGroupBySlugDocument,
    "\n  mutation CreateGroup($input: NewGroup!) {\n    createGroup(input: $input) {\n      id\n      name\n      slug\n      type\n    }\n  }\n": typeof types.CreateGroupDocument,
    "\n  mutation JoinGroup($groupId: ID!) {\n    joinGroup(groupId: $groupId)\n  }\n": typeof types.JoinGroupDocument,
    "\n  mutation LeaveGroup($groupId: ID!) {\n    leaveGroup(groupId: $groupId)\n  }\n": typeof types.LeaveGroupDocument,
    "\n  mutation DeleteGroup($groupId: ID!) {\n    deleteGroup(groupId: $groupId)\n  }\n": typeof types.DeleteGroupDocument,
    "\n  mutation UpdateGroup($groupId: ID!, $name: String, $description: String, $icon: String) {\n    updateGroup(groupId: $groupId, name: $name, description: $description, icon: $icon) {\n      id\n      name\n      description\n      icon\n      slug\n    }\n  }\n": typeof types.UpdateGroupDocument,
    "\n  mutation CreatePost($input: NewPost!) {\n    createPost(input: $input) {\n      id\n      title\n      content\n      createdAt\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": typeof types.CreatePostDocument,
    "\n  query GetDiscussion($groupId: ID!) {\n    discussion(groupId: $groupId) {\n      id\n      channels {\n        id\n        name\n        type\n      }\n    }\n  }\n": typeof types.GetDiscussionDocument,
    "\n  query GetChannelMessages($channelId: ID!, $limit: Int, $offset: Int) {\n    channel(id: $channelId) {\n      id\n      name\n      type\n      messages(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        sender {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": typeof types.GetChannelMessagesDocument,
    "\n  mutation SendMessage($input: NewMessage!) {\n    sendMessage(input: $input) {\n      id\n      content\n      createdAt\n      sender {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": typeof types.SendMessageDocument,
    "\n  mutation CreateChannel($input: NewChannel!) {\n    createChannel(input: $input) {\n      id\n      name\n      type\n    }\n  }\n": typeof types.CreateChannelDocument,
    "\n  query GetPost($id: ID!) {\n    post(id: $id) {\n      id\n      title\n      content\n      createdAt\n      commentsCount\n      upvotes\n      downvotes\n      userVote\n      isEdited\n      author {\n        id\n        name\n        username\n        avatar\n      }\n      group {\n        id\n        name\n        slug\n      }\n      comments(limit: 20, offset: 0) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": typeof types.GetPostDocument,
    "\n  mutation CreateComment($input: NewComment!) {\n    createComment(input: $input) {\n      id\n      content\n      createdAt\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": typeof types.CreateCommentDocument,
    "\n  mutation VotePost($postId: ID!, $type: VoteType!) {\n    votePost(postId: $postId, type: $type) {\n      id\n      upvotes\n      downvotes\n      userVote\n    }\n  }\n": typeof types.VotePostDocument,
    "\n  mutation VoteComment($commentId: ID!, $type: VoteType!) {\n    voteComment(commentId: $commentId, type: $type) {\n      id\n      upvotes\n      downvotes\n      userVote\n    }\n  }\n": typeof types.VoteCommentDocument,
    "\n  mutation UpdatePost($postId: ID!, $title: String, $content: String) {\n    updatePost(postId: $postId, title: $title, content: $content) {\n      id\n      title\n      content\n      isEdited\n    }\n  }\n": typeof types.UpdatePostDocument,
    "\n  mutation DeletePost($postId: ID!) {\n    deletePost(postId: $postId)\n  }\n": typeof types.DeletePostDocument,
    "\n  mutation UpdateComment($commentId: ID!, $content: String!) {\n    updateComment(commentId: $commentId, content: $content) {\n      id\n      content\n      isEdited\n    }\n  }\n": typeof types.UpdateCommentDocument,
    "\n  mutation DeleteComment($commentId: ID!) {\n    deleteComment(commentId: $commentId)\n  }\n": typeof types.DeleteCommentDocument,
    "\n  query GetComments($postId: ID!, $limit: Int!, $offset: Int!) {\n    post(id: $postId) {\n      comments(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": typeof types.GetCommentsDocument,
    "\n  query GetReplies($commentId: ID!, $limit: Int!, $offset: Int!) {\n    comment(id: $commentId) {\n      replies(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": typeof types.GetRepliesDocument,
    "\n  query GetPublicPosts($limit: Int, $offset: Int) {\n    publicPosts(limit: $limit, offset: $offset) {\n      id\n      title\n      content\n      createdAt\n      commentsCount\n      upvotes\n      downvotes\n      userVote\n      isEdited\n      author {\n        id\n        name\n        username\n        avatar\n      }\n      group {\n        id\n        name\n        slug\n        type\n      }\n    }\n  }\n": typeof types.GetPublicPostsDocument,
    "\n  mutation UploadUserImage($file: Upload!) {\n    uploadUserImage(file: $file)\n  }\n": typeof types.UploadUserImageDocument,
    "\n  mutation GenerateGroupInvite($groupId: ID!) {\n    generateGroupInvite(groupId: $groupId)\n  }\n": typeof types.GenerateGroupInviteDocument,
    "\n  mutation RequestJoinGroup($groupId: ID!, $token: String!) {\n    requestJoinGroup(groupId: $groupId, token: $token)\n  }\n": typeof types.RequestJoinGroupDocument,
    "\n  mutation AcceptJoinRequest($groupId: ID!, $userId: ID!) {\n    acceptJoinRequest(groupId: $groupId, userId: $userId)\n  }\n": typeof types.AcceptJoinRequestDocument,
    "\n  mutation RejectJoinRequest($groupId: ID!, $userId: ID!) {\n    rejectJoinRequest(groupId: $groupId, userId: $userId)\n  }\n": typeof types.RejectJoinRequestDocument,
    "\n  mutation RemoveMember($groupId: ID!, $userId: ID!) {\n    removeMember(groupId: $groupId, userId: $userId)\n  }\n": typeof types.RemoveMemberDocument,
    "\n  query GetGroupByInviteToken($token: String!) {\n    groupByInviteToken(token: $token) {\n      id\n      name\n      description\n      icon\n      slug\n      type\n      membersCount\n      isMember\n      hasPendingRequest\n      createdAt\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": typeof types.GetGroupByInviteTokenDocument,
    "\n  query SearchArticles($query: String!, $limit: Int, $offset: Int) {\n    searchArticles(query: $query, limit: $limit, offset: $offset) {\n      id\n      title\n      slug\n      description\n      thumbnail\n      category\n      createdAt\n      author {\n        name\n        avatar\n      }\n    }\n  }\n": typeof types.SearchArticlesDocument,
    "\n  query SearchCommunity($query: String!, $limit: Int, $offset: Int) {\n    searchCommunity(query: $query, limit: $limit, offset: $offset) {\n      ... on Post {\n        id\n        title\n        content\n        createdAt\n        author {\n          name\n          username\n          avatar\n        }\n        group {\n          name\n          slug\n        }\n      }\n      ... on Group {\n        id\n        name\n        description\n        slug\n        membersCount\n        createdAt\n      }\n      ... on Comment {\n        id\n        content\n        createdAt\n        author {\n          name\n          username\n          avatar\n        }\n        post {\n          id\n          title\n          group {\n            slug\n          }\n        }\n      }\n    }\n  }\n": typeof types.SearchCommunityDocument,
    "\n  query GetPublicUser($username: String!) {\n    user(username: $username) {\n      id\n      username\n      displayName\n      avatar\n      gender\n    }\n  }\n": typeof types.GetPublicUserDocument,
    "\n  query GetUserPosts($username: String!, $limit: Int, $offset: Int) {\n    user(username: $username) {\n      id\n      posts(limit: $limit, offset: $offset) {\n        id\n        title\n        content\n        createdAt\n        voteStatus: userVote\n        upvotesCount: upvotes\n        downvotesCount: downvotes\n        commentsCount\n        author {\n          id\n          username\n          displayName\n          avatar\n        }\n        group {\n          id\n          name\n          slug\n        }\n      }\n    }\n  }\n": typeof types.GetUserPostsDocument,
    "\n  query GetUserComments($username: String!, $limit: Int, $offset: Int) {\n    user(username: $username) {\n      id\n      comments(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        voteStatus: userVote\n        upvotesCount: upvotes\n        downvotesCount: downvotes\n        repliesCount\n        author {\n          id\n          username\n          displayName\n          avatar\n        }\n        post {\n          id\n          title\n          group {\n            id\n            slug\n            name\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetUserCommentsDocument,
    "\n  query GetUserGroups($username: String!) {\n    userGroups(username: $username) {\n        id\n        name\n        slug\n        description\n        membersCount\n    }\n  }\n": typeof types.GetUserGroupsDocument,
    "\n  query GetMe {\n    me {\n      id\n      username\n      displayName\n      avatar\n      isAdmin\n    }\n  }\n": typeof types.GetMeDocument,
    "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      displayName\n      avatar\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  mutation UploadAvatar($file: Upload!) {\n    uploadAvatar(file: $file)\n  }\n": typeof types.UploadAvatarDocument,
};
const documents: Documents = {
    "\n        mutation SignIn($input: NewUser!) {\n          signIn(input: $input)\n        }\n          ": types.SignInDocument,
    "\n            query GetCurrentUser {\n              me {\n                id\n                username\n                displayName\n                setupComplete\n                isAdmin\n              }\n            }\n          ": types.GetCurrentUserDocument,
    "\n  mutation CompleteSetup($input: CompleteSetupInput!) {\n    completeSetup(input: $input)\n  }\n": types.CompleteSetupDocument,
    "\n  query CheckUsername($username: String!) {\n    checkUsername(username: $username)\n  }\n": types.CheckUsernameDocument,
    "\n  query GetArticleBySlug($slug: String!) {\n    articleBySlug(slug: $slug) {\n      id\n      title\n      slug\n      content\n      category\n      thumbnail\n      createdAt\n      updatedAt\n      description\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": types.GetArticleBySlugDocument,
    "\n  query GetGroups($limit: Int, $offset: Int) {\n    publicGroups(limit: $limit, offset: $offset) {\n      id\n      name\n      description\n      slug\n      type\n      membersCount\n      isMember\n      createdAt\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": types.GetGroupsDocument,
    "\n  query GetMyGroups {\n    myGroups {\n      id\n      name\n      slug\n      membersCount\n      icon\n    }\n  }\n": types.GetMyGroupsDocument,
    "\n  query GetGroupBySlug($slug: String!, $postLimit: Int, $postOffset: Int) {\n    group(slug: $slug) {\n      id\n      name\n      description\n      icon\n      slug\n      type\n      membersCount\n      isMember\n      createdAt\n      inviteToken\n      joinRequests {\n        id\n        name\n        username\n        avatar\n      }\n      members {\n        id\n        name\n        username\n        avatar\n      }\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n      posts(limit: $postLimit, offset: $postOffset) {\n        id\n        title\n        content\n        createdAt\n        commentsCount\n        upvotes\n        downvotes\n        userVote\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": types.GetGroupBySlugDocument,
    "\n  mutation CreateGroup($input: NewGroup!) {\n    createGroup(input: $input) {\n      id\n      name\n      slug\n      type\n    }\n  }\n": types.CreateGroupDocument,
    "\n  mutation JoinGroup($groupId: ID!) {\n    joinGroup(groupId: $groupId)\n  }\n": types.JoinGroupDocument,
    "\n  mutation LeaveGroup($groupId: ID!) {\n    leaveGroup(groupId: $groupId)\n  }\n": types.LeaveGroupDocument,
    "\n  mutation DeleteGroup($groupId: ID!) {\n    deleteGroup(groupId: $groupId)\n  }\n": types.DeleteGroupDocument,
    "\n  mutation UpdateGroup($groupId: ID!, $name: String, $description: String, $icon: String) {\n    updateGroup(groupId: $groupId, name: $name, description: $description, icon: $icon) {\n      id\n      name\n      description\n      icon\n      slug\n    }\n  }\n": types.UpdateGroupDocument,
    "\n  mutation CreatePost($input: NewPost!) {\n    createPost(input: $input) {\n      id\n      title\n      content\n      createdAt\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": types.CreatePostDocument,
    "\n  query GetDiscussion($groupId: ID!) {\n    discussion(groupId: $groupId) {\n      id\n      channels {\n        id\n        name\n        type\n      }\n    }\n  }\n": types.GetDiscussionDocument,
    "\n  query GetChannelMessages($channelId: ID!, $limit: Int, $offset: Int) {\n    channel(id: $channelId) {\n      id\n      name\n      type\n      messages(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        sender {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": types.GetChannelMessagesDocument,
    "\n  mutation SendMessage($input: NewMessage!) {\n    sendMessage(input: $input) {\n      id\n      content\n      createdAt\n      sender {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": types.SendMessageDocument,
    "\n  mutation CreateChannel($input: NewChannel!) {\n    createChannel(input: $input) {\n      id\n      name\n      type\n    }\n  }\n": types.CreateChannelDocument,
    "\n  query GetPost($id: ID!) {\n    post(id: $id) {\n      id\n      title\n      content\n      createdAt\n      commentsCount\n      upvotes\n      downvotes\n      userVote\n      isEdited\n      author {\n        id\n        name\n        username\n        avatar\n      }\n      group {\n        id\n        name\n        slug\n      }\n      comments(limit: 20, offset: 0) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": types.GetPostDocument,
    "\n  mutation CreateComment($input: NewComment!) {\n    createComment(input: $input) {\n      id\n      content\n      createdAt\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": types.CreateCommentDocument,
    "\n  mutation VotePost($postId: ID!, $type: VoteType!) {\n    votePost(postId: $postId, type: $type) {\n      id\n      upvotes\n      downvotes\n      userVote\n    }\n  }\n": types.VotePostDocument,
    "\n  mutation VoteComment($commentId: ID!, $type: VoteType!) {\n    voteComment(commentId: $commentId, type: $type) {\n      id\n      upvotes\n      downvotes\n      userVote\n    }\n  }\n": types.VoteCommentDocument,
    "\n  mutation UpdatePost($postId: ID!, $title: String, $content: String) {\n    updatePost(postId: $postId, title: $title, content: $content) {\n      id\n      title\n      content\n      isEdited\n    }\n  }\n": types.UpdatePostDocument,
    "\n  mutation DeletePost($postId: ID!) {\n    deletePost(postId: $postId)\n  }\n": types.DeletePostDocument,
    "\n  mutation UpdateComment($commentId: ID!, $content: String!) {\n    updateComment(commentId: $commentId, content: $content) {\n      id\n      content\n      isEdited\n    }\n  }\n": types.UpdateCommentDocument,
    "\n  mutation DeleteComment($commentId: ID!) {\n    deleteComment(commentId: $commentId)\n  }\n": types.DeleteCommentDocument,
    "\n  query GetComments($postId: ID!, $limit: Int!, $offset: Int!) {\n    post(id: $postId) {\n      comments(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": types.GetCommentsDocument,
    "\n  query GetReplies($commentId: ID!, $limit: Int!, $offset: Int!) {\n    comment(id: $commentId) {\n      replies(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n": types.GetRepliesDocument,
    "\n  query GetPublicPosts($limit: Int, $offset: Int) {\n    publicPosts(limit: $limit, offset: $offset) {\n      id\n      title\n      content\n      createdAt\n      commentsCount\n      upvotes\n      downvotes\n      userVote\n      isEdited\n      author {\n        id\n        name\n        username\n        avatar\n      }\n      group {\n        id\n        name\n        slug\n        type\n      }\n    }\n  }\n": types.GetPublicPostsDocument,
    "\n  mutation UploadUserImage($file: Upload!) {\n    uploadUserImage(file: $file)\n  }\n": types.UploadUserImageDocument,
    "\n  mutation GenerateGroupInvite($groupId: ID!) {\n    generateGroupInvite(groupId: $groupId)\n  }\n": types.GenerateGroupInviteDocument,
    "\n  mutation RequestJoinGroup($groupId: ID!, $token: String!) {\n    requestJoinGroup(groupId: $groupId, token: $token)\n  }\n": types.RequestJoinGroupDocument,
    "\n  mutation AcceptJoinRequest($groupId: ID!, $userId: ID!) {\n    acceptJoinRequest(groupId: $groupId, userId: $userId)\n  }\n": types.AcceptJoinRequestDocument,
    "\n  mutation RejectJoinRequest($groupId: ID!, $userId: ID!) {\n    rejectJoinRequest(groupId: $groupId, userId: $userId)\n  }\n": types.RejectJoinRequestDocument,
    "\n  mutation RemoveMember($groupId: ID!, $userId: ID!) {\n    removeMember(groupId: $groupId, userId: $userId)\n  }\n": types.RemoveMemberDocument,
    "\n  query GetGroupByInviteToken($token: String!) {\n    groupByInviteToken(token: $token) {\n      id\n      name\n      description\n      icon\n      slug\n      type\n      membersCount\n      isMember\n      hasPendingRequest\n      createdAt\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n": types.GetGroupByInviteTokenDocument,
    "\n  query SearchArticles($query: String!, $limit: Int, $offset: Int) {\n    searchArticles(query: $query, limit: $limit, offset: $offset) {\n      id\n      title\n      slug\n      description\n      thumbnail\n      category\n      createdAt\n      author {\n        name\n        avatar\n      }\n    }\n  }\n": types.SearchArticlesDocument,
    "\n  query SearchCommunity($query: String!, $limit: Int, $offset: Int) {\n    searchCommunity(query: $query, limit: $limit, offset: $offset) {\n      ... on Post {\n        id\n        title\n        content\n        createdAt\n        author {\n          name\n          username\n          avatar\n        }\n        group {\n          name\n          slug\n        }\n      }\n      ... on Group {\n        id\n        name\n        description\n        slug\n        membersCount\n        createdAt\n      }\n      ... on Comment {\n        id\n        content\n        createdAt\n        author {\n          name\n          username\n          avatar\n        }\n        post {\n          id\n          title\n          group {\n            slug\n          }\n        }\n      }\n    }\n  }\n": types.SearchCommunityDocument,
    "\n  query GetPublicUser($username: String!) {\n    user(username: $username) {\n      id\n      username\n      displayName\n      avatar\n      gender\n    }\n  }\n": types.GetPublicUserDocument,
    "\n  query GetUserPosts($username: String!, $limit: Int, $offset: Int) {\n    user(username: $username) {\n      id\n      posts(limit: $limit, offset: $offset) {\n        id\n        title\n        content\n        createdAt\n        voteStatus: userVote\n        upvotesCount: upvotes\n        downvotesCount: downvotes\n        commentsCount\n        author {\n          id\n          username\n          displayName\n          avatar\n        }\n        group {\n          id\n          name\n          slug\n        }\n      }\n    }\n  }\n": types.GetUserPostsDocument,
    "\n  query GetUserComments($username: String!, $limit: Int, $offset: Int) {\n    user(username: $username) {\n      id\n      comments(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        voteStatus: userVote\n        upvotesCount: upvotes\n        downvotesCount: downvotes\n        repliesCount\n        author {\n          id\n          username\n          displayName\n          avatar\n        }\n        post {\n          id\n          title\n          group {\n            id\n            slug\n            name\n          }\n        }\n      }\n    }\n  }\n": types.GetUserCommentsDocument,
    "\n  query GetUserGroups($username: String!) {\n    userGroups(username: $username) {\n        id\n        name\n        slug\n        description\n        membersCount\n    }\n  }\n": types.GetUserGroupsDocument,
    "\n  query GetMe {\n    me {\n      id\n      username\n      displayName\n      avatar\n      isAdmin\n    }\n  }\n": types.GetMeDocument,
    "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      displayName\n      avatar\n    }\n  }\n": types.UpdateUserDocument,
    "\n  mutation UploadAvatar($file: Upload!) {\n    uploadAvatar(file: $file)\n  }\n": types.UploadAvatarDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n        mutation SignIn($input: NewUser!) {\n          signIn(input: $input)\n        }\n          "): (typeof documents)["\n        mutation SignIn($input: NewUser!) {\n          signIn(input: $input)\n        }\n          "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n            query GetCurrentUser {\n              me {\n                id\n                username\n                displayName\n                setupComplete\n                isAdmin\n              }\n            }\n          "): (typeof documents)["\n            query GetCurrentUser {\n              me {\n                id\n                username\n                displayName\n                setupComplete\n                isAdmin\n              }\n            }\n          "];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CompleteSetup($input: CompleteSetupInput!) {\n    completeSetup(input: $input)\n  }\n"): (typeof documents)["\n  mutation CompleteSetup($input: CompleteSetupInput!) {\n    completeSetup(input: $input)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CheckUsername($username: String!) {\n    checkUsername(username: $username)\n  }\n"): (typeof documents)["\n  query CheckUsername($username: String!) {\n    checkUsername(username: $username)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetArticleBySlug($slug: String!) {\n    articleBySlug(slug: $slug) {\n      id\n      title\n      slug\n      content\n      category\n      thumbnail\n      createdAt\n      updatedAt\n      description\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetArticleBySlug($slug: String!) {\n    articleBySlug(slug: $slug) {\n      id\n      title\n      slug\n      content\n      category\n      thumbnail\n      createdAt\n      updatedAt\n      description\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetGroups($limit: Int, $offset: Int) {\n    publicGroups(limit: $limit, offset: $offset) {\n      id\n      name\n      description\n      slug\n      type\n      membersCount\n      isMember\n      createdAt\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGroups($limit: Int, $offset: Int) {\n    publicGroups(limit: $limit, offset: $offset) {\n      id\n      name\n      description\n      slug\n      type\n      membersCount\n      isMember\n      createdAt\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMyGroups {\n    myGroups {\n      id\n      name\n      slug\n      membersCount\n      icon\n    }\n  }\n"): (typeof documents)["\n  query GetMyGroups {\n    myGroups {\n      id\n      name\n      slug\n      membersCount\n      icon\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetGroupBySlug($slug: String!, $postLimit: Int, $postOffset: Int) {\n    group(slug: $slug) {\n      id\n      name\n      description\n      icon\n      slug\n      type\n      membersCount\n      isMember\n      createdAt\n      inviteToken\n      joinRequests {\n        id\n        name\n        username\n        avatar\n      }\n      members {\n        id\n        name\n        username\n        avatar\n      }\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n      posts(limit: $postLimit, offset: $postOffset) {\n        id\n        title\n        content\n        createdAt\n        commentsCount\n        upvotes\n        downvotes\n        userVote\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGroupBySlug($slug: String!, $postLimit: Int, $postOffset: Int) {\n    group(slug: $slug) {\n      id\n      name\n      description\n      icon\n      slug\n      type\n      membersCount\n      isMember\n      createdAt\n      inviteToken\n      joinRequests {\n        id\n        name\n        username\n        avatar\n      }\n      members {\n        id\n        name\n        username\n        avatar\n      }\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n      posts(limit: $postLimit, offset: $postOffset) {\n        id\n        title\n        content\n        createdAt\n        commentsCount\n        upvotes\n        downvotes\n        userVote\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateGroup($input: NewGroup!) {\n    createGroup(input: $input) {\n      id\n      name\n      slug\n      type\n    }\n  }\n"): (typeof documents)["\n  mutation CreateGroup($input: NewGroup!) {\n    createGroup(input: $input) {\n      id\n      name\n      slug\n      type\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation JoinGroup($groupId: ID!) {\n    joinGroup(groupId: $groupId)\n  }\n"): (typeof documents)["\n  mutation JoinGroup($groupId: ID!) {\n    joinGroup(groupId: $groupId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation LeaveGroup($groupId: ID!) {\n    leaveGroup(groupId: $groupId)\n  }\n"): (typeof documents)["\n  mutation LeaveGroup($groupId: ID!) {\n    leaveGroup(groupId: $groupId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteGroup($groupId: ID!) {\n    deleteGroup(groupId: $groupId)\n  }\n"): (typeof documents)["\n  mutation DeleteGroup($groupId: ID!) {\n    deleteGroup(groupId: $groupId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateGroup($groupId: ID!, $name: String, $description: String, $icon: String) {\n    updateGroup(groupId: $groupId, name: $name, description: $description, icon: $icon) {\n      id\n      name\n      description\n      icon\n      slug\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateGroup($groupId: ID!, $name: String, $description: String, $icon: String) {\n    updateGroup(groupId: $groupId, name: $name, description: $description, icon: $icon) {\n      id\n      name\n      description\n      icon\n      slug\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreatePost($input: NewPost!) {\n    createPost(input: $input) {\n      id\n      title\n      content\n      createdAt\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePost($input: NewPost!) {\n    createPost(input: $input) {\n      id\n      title\n      content\n      createdAt\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDiscussion($groupId: ID!) {\n    discussion(groupId: $groupId) {\n      id\n      channels {\n        id\n        name\n        type\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetDiscussion($groupId: ID!) {\n    discussion(groupId: $groupId) {\n      id\n      channels {\n        id\n        name\n        type\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetChannelMessages($channelId: ID!, $limit: Int, $offset: Int) {\n    channel(id: $channelId) {\n      id\n      name\n      type\n      messages(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        sender {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetChannelMessages($channelId: ID!, $limit: Int, $offset: Int) {\n    channel(id: $channelId) {\n      id\n      name\n      type\n      messages(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        sender {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SendMessage($input: NewMessage!) {\n    sendMessage(input: $input) {\n      id\n      content\n      createdAt\n      sender {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SendMessage($input: NewMessage!) {\n    sendMessage(input: $input) {\n      id\n      content\n      createdAt\n      sender {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateChannel($input: NewChannel!) {\n    createChannel(input: $input) {\n      id\n      name\n      type\n    }\n  }\n"): (typeof documents)["\n  mutation CreateChannel($input: NewChannel!) {\n    createChannel(input: $input) {\n      id\n      name\n      type\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetPost($id: ID!) {\n    post(id: $id) {\n      id\n      title\n      content\n      createdAt\n      commentsCount\n      upvotes\n      downvotes\n      userVote\n      isEdited\n      author {\n        id\n        name\n        username\n        avatar\n      }\n      group {\n        id\n        name\n        slug\n      }\n      comments(limit: 20, offset: 0) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPost($id: ID!) {\n    post(id: $id) {\n      id\n      title\n      content\n      createdAt\n      commentsCount\n      upvotes\n      downvotes\n      userVote\n      isEdited\n      author {\n        id\n        name\n        username\n        avatar\n      }\n      group {\n        id\n        name\n        slug\n      }\n      comments(limit: 20, offset: 0) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateComment($input: NewComment!) {\n    createComment(input: $input) {\n      id\n      content\n      createdAt\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateComment($input: NewComment!) {\n    createComment(input: $input) {\n      id\n      content\n      createdAt\n      author {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation VotePost($postId: ID!, $type: VoteType!) {\n    votePost(postId: $postId, type: $type) {\n      id\n      upvotes\n      downvotes\n      userVote\n    }\n  }\n"): (typeof documents)["\n  mutation VotePost($postId: ID!, $type: VoteType!) {\n    votePost(postId: $postId, type: $type) {\n      id\n      upvotes\n      downvotes\n      userVote\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation VoteComment($commentId: ID!, $type: VoteType!) {\n    voteComment(commentId: $commentId, type: $type) {\n      id\n      upvotes\n      downvotes\n      userVote\n    }\n  }\n"): (typeof documents)["\n  mutation VoteComment($commentId: ID!, $type: VoteType!) {\n    voteComment(commentId: $commentId, type: $type) {\n      id\n      upvotes\n      downvotes\n      userVote\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdatePost($postId: ID!, $title: String, $content: String) {\n    updatePost(postId: $postId, title: $title, content: $content) {\n      id\n      title\n      content\n      isEdited\n    }\n  }\n"): (typeof documents)["\n  mutation UpdatePost($postId: ID!, $title: String, $content: String) {\n    updatePost(postId: $postId, title: $title, content: $content) {\n      id\n      title\n      content\n      isEdited\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeletePost($postId: ID!) {\n    deletePost(postId: $postId)\n  }\n"): (typeof documents)["\n  mutation DeletePost($postId: ID!) {\n    deletePost(postId: $postId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateComment($commentId: ID!, $content: String!) {\n    updateComment(commentId: $commentId, content: $content) {\n      id\n      content\n      isEdited\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateComment($commentId: ID!, $content: String!) {\n    updateComment(commentId: $commentId, content: $content) {\n      id\n      content\n      isEdited\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteComment($commentId: ID!) {\n    deleteComment(commentId: $commentId)\n  }\n"): (typeof documents)["\n  mutation DeleteComment($commentId: ID!) {\n    deleteComment(commentId: $commentId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetComments($postId: ID!, $limit: Int!, $offset: Int!) {\n    post(id: $postId) {\n      comments(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetComments($postId: ID!, $limit: Int!, $offset: Int!) {\n    post(id: $postId) {\n      comments(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetReplies($commentId: ID!, $limit: Int!, $offset: Int!) {\n    comment(id: $commentId) {\n      replies(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetReplies($commentId: ID!, $limit: Int!, $offset: Int!) {\n    comment(id: $commentId) {\n      replies(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        upvotes\n        downvotes\n        userVote\n        repliesCount\n        isEdited\n        author {\n          id\n          name\n          username\n          avatar\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetPublicPosts($limit: Int, $offset: Int) {\n    publicPosts(limit: $limit, offset: $offset) {\n      id\n      title\n      content\n      createdAt\n      commentsCount\n      upvotes\n      downvotes\n      userVote\n      isEdited\n      author {\n        id\n        name\n        username\n        avatar\n      }\n      group {\n        id\n        name\n        slug\n        type\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPublicPosts($limit: Int, $offset: Int) {\n    publicPosts(limit: $limit, offset: $offset) {\n      id\n      title\n      content\n      createdAt\n      commentsCount\n      upvotes\n      downvotes\n      userVote\n      isEdited\n      author {\n        id\n        name\n        username\n        avatar\n      }\n      group {\n        id\n        name\n        slug\n        type\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UploadUserImage($file: Upload!) {\n    uploadUserImage(file: $file)\n  }\n"): (typeof documents)["\n  mutation UploadUserImage($file: Upload!) {\n    uploadUserImage(file: $file)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation GenerateGroupInvite($groupId: ID!) {\n    generateGroupInvite(groupId: $groupId)\n  }\n"): (typeof documents)["\n  mutation GenerateGroupInvite($groupId: ID!) {\n    generateGroupInvite(groupId: $groupId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RequestJoinGroup($groupId: ID!, $token: String!) {\n    requestJoinGroup(groupId: $groupId, token: $token)\n  }\n"): (typeof documents)["\n  mutation RequestJoinGroup($groupId: ID!, $token: String!) {\n    requestJoinGroup(groupId: $groupId, token: $token)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AcceptJoinRequest($groupId: ID!, $userId: ID!) {\n    acceptJoinRequest(groupId: $groupId, userId: $userId)\n  }\n"): (typeof documents)["\n  mutation AcceptJoinRequest($groupId: ID!, $userId: ID!) {\n    acceptJoinRequest(groupId: $groupId, userId: $userId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RejectJoinRequest($groupId: ID!, $userId: ID!) {\n    rejectJoinRequest(groupId: $groupId, userId: $userId)\n  }\n"): (typeof documents)["\n  mutation RejectJoinRequest($groupId: ID!, $userId: ID!) {\n    rejectJoinRequest(groupId: $groupId, userId: $userId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveMember($groupId: ID!, $userId: ID!) {\n    removeMember(groupId: $groupId, userId: $userId)\n  }\n"): (typeof documents)["\n  mutation RemoveMember($groupId: ID!, $userId: ID!) {\n    removeMember(groupId: $groupId, userId: $userId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetGroupByInviteToken($token: String!) {\n    groupByInviteToken(token: $token) {\n      id\n      name\n      description\n      icon\n      slug\n      type\n      membersCount\n      isMember\n      hasPendingRequest\n      createdAt\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGroupByInviteToken($token: String!) {\n    groupByInviteToken(token: $token) {\n      id\n      name\n      description\n      icon\n      slug\n      type\n      membersCount\n      isMember\n      hasPendingRequest\n      createdAt\n      owner {\n        id\n        name\n        username\n        avatar\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query SearchArticles($query: String!, $limit: Int, $offset: Int) {\n    searchArticles(query: $query, limit: $limit, offset: $offset) {\n      id\n      title\n      slug\n      description\n      thumbnail\n      category\n      createdAt\n      author {\n        name\n        avatar\n      }\n    }\n  }\n"): (typeof documents)["\n  query SearchArticles($query: String!, $limit: Int, $offset: Int) {\n    searchArticles(query: $query, limit: $limit, offset: $offset) {\n      id\n      title\n      slug\n      description\n      thumbnail\n      category\n      createdAt\n      author {\n        name\n        avatar\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query SearchCommunity($query: String!, $limit: Int, $offset: Int) {\n    searchCommunity(query: $query, limit: $limit, offset: $offset) {\n      ... on Post {\n        id\n        title\n        content\n        createdAt\n        author {\n          name\n          username\n          avatar\n        }\n        group {\n          name\n          slug\n        }\n      }\n      ... on Group {\n        id\n        name\n        description\n        slug\n        membersCount\n        createdAt\n      }\n      ... on Comment {\n        id\n        content\n        createdAt\n        author {\n          name\n          username\n          avatar\n        }\n        post {\n          id\n          title\n          group {\n            slug\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query SearchCommunity($query: String!, $limit: Int, $offset: Int) {\n    searchCommunity(query: $query, limit: $limit, offset: $offset) {\n      ... on Post {\n        id\n        title\n        content\n        createdAt\n        author {\n          name\n          username\n          avatar\n        }\n        group {\n          name\n          slug\n        }\n      }\n      ... on Group {\n        id\n        name\n        description\n        slug\n        membersCount\n        createdAt\n      }\n      ... on Comment {\n        id\n        content\n        createdAt\n        author {\n          name\n          username\n          avatar\n        }\n        post {\n          id\n          title\n          group {\n            slug\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetPublicUser($username: String!) {\n    user(username: $username) {\n      id\n      username\n      displayName\n      avatar\n      gender\n    }\n  }\n"): (typeof documents)["\n  query GetPublicUser($username: String!) {\n    user(username: $username) {\n      id\n      username\n      displayName\n      avatar\n      gender\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserPosts($username: String!, $limit: Int, $offset: Int) {\n    user(username: $username) {\n      id\n      posts(limit: $limit, offset: $offset) {\n        id\n        title\n        content\n        createdAt\n        voteStatus: userVote\n        upvotesCount: upvotes\n        downvotesCount: downvotes\n        commentsCount\n        author {\n          id\n          username\n          displayName\n          avatar\n        }\n        group {\n          id\n          name\n          slug\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUserPosts($username: String!, $limit: Int, $offset: Int) {\n    user(username: $username) {\n      id\n      posts(limit: $limit, offset: $offset) {\n        id\n        title\n        content\n        createdAt\n        voteStatus: userVote\n        upvotesCount: upvotes\n        downvotesCount: downvotes\n        commentsCount\n        author {\n          id\n          username\n          displayName\n          avatar\n        }\n        group {\n          id\n          name\n          slug\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserComments($username: String!, $limit: Int, $offset: Int) {\n    user(username: $username) {\n      id\n      comments(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        voteStatus: userVote\n        upvotesCount: upvotes\n        downvotesCount: downvotes\n        repliesCount\n        author {\n          id\n          username\n          displayName\n          avatar\n        }\n        post {\n          id\n          title\n          group {\n            id\n            slug\n            name\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUserComments($username: String!, $limit: Int, $offset: Int) {\n    user(username: $username) {\n      id\n      comments(limit: $limit, offset: $offset) {\n        id\n        content\n        createdAt\n        voteStatus: userVote\n        upvotesCount: upvotes\n        downvotesCount: downvotes\n        repliesCount\n        author {\n          id\n          username\n          displayName\n          avatar\n        }\n        post {\n          id\n          title\n          group {\n            id\n            slug\n            name\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserGroups($username: String!) {\n    userGroups(username: $username) {\n        id\n        name\n        slug\n        description\n        membersCount\n    }\n  }\n"): (typeof documents)["\n  query GetUserGroups($username: String!) {\n    userGroups(username: $username) {\n        id\n        name\n        slug\n        description\n        membersCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMe {\n    me {\n      id\n      username\n      displayName\n      avatar\n      isAdmin\n    }\n  }\n"): (typeof documents)["\n  query GetMe {\n    me {\n      id\n      username\n      displayName\n      avatar\n      isAdmin\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      displayName\n      avatar\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      displayName\n      avatar\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UploadAvatar($file: Upload!) {\n    uploadAvatar(file: $file)\n  }\n"): (typeof documents)["\n  mutation UploadAvatar($file: Upload!) {\n    uploadAvatar(file: $file)\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;