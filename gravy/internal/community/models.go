package community

import (
	"time"
)

type GroupType string

const (
	GroupTypePublic  GroupType = "PUBLIC"
	GroupTypePrivate GroupType = "PRIVATE"
)

type Group struct {
	ID           string    `bson:"_id,omitempty"`
	Name         string    `bson:"name"`
	Description  string    `bson:"description"`
	Slug         string    `bson:"slug"`
	Type         GroupType `bson:"type"`
	OwnerID      string    `bson:"ownerId"`
	MembersCount int       `bson:"membersCount"`
	CreatedAt    time.Time `bson:"createdAt"`
	MemberIDs    []string  `bson:"memberIds"`
	Indexed      bool      `bson:"indexed"`
	Icon         string    `bson:"icon,omitempty"`
}

type GroupFilter struct {
	OwnerID *string
	Type    *GroupType
}

type Post struct {
	ID             string    `bson:"_id,omitempty"`
	Title          string    `bson:"title"`
	Content        string    `bson:"content"`
	AuthorID       string    `bson:"authorId"`
	GroupID        string    `bson:"groupId"`
	CommentsCount  int       `bson:"commentsCount"`
	UpvotesCount   int       `bson:"upvotesCount"`
	DownvotesCount int       `bson:"downvotesCount"`
	Indexed        bool      `bson:"indexed"`
	CreatedAt      time.Time `bson:"createdAt"`
}

type Comment struct {
	ID             string    `bson:"_id,omitempty"`
	Content        string    `bson:"content"`
	AuthorID       string    `bson:"authorId"`
	PostID         string    `bson:"postId"`
	ParentID       *string   `bson:"parentId,omitempty"`
	UpvotesCount   int       `bson:"upvotesCount"`
	DownvotesCount int       `bson:"downvotesCount"`
	RepliesCount   int       `bson:"repliesCount"`
	Indexed        bool      `bson:"indexed"`
	CreatedAt      time.Time `bson:"createdAt"`
}

type Vote struct {
	ID        string    `bson:"_id,omitempty"`
	UserID    string    `bson:"userId"`
	PostID    string    `bson:"postId"`
	Type      string    `bson:"type"`
	CreatedAt time.Time `bson:"createdAt"`
}

type CommentVote struct {
	ID        string    `bson:"_id,omitempty"`
	UserID    string    `bson:"userId"`
	CommentID string    `bson:"commentId"`
	Type      string    `bson:"type"`
	CreatedAt time.Time `bson:"createdAt"`
}

type Discussion struct {
	ID      string `bson:"_id,omitempty"`
	GroupID string `bson:"groupId"`
}

type ChannelType string

const (
	ChannelTypeText ChannelType = "TEXT"
)

type Channel struct {
	ID           string      `bson:"_id,omitempty"`
	DiscussionID string      `bson:"discussionId"`
	Name         string      `bson:"name"`
	Type         ChannelType `bson:"type"`
	CreatedAt    time.Time   `bson:"createdAt"`
}

type Message struct {
	ID        string    `bson:"_id,omitempty"`
	ChannelID string    `bson:"channelId"`
	SenderID  string    `bson:"senderId"`
	Content   string    `bson:"content"`
	CreatedAt time.Time `bson:"createdAt"`
}
