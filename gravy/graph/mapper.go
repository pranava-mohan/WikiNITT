package graph

import (
	"github.com/pranava-mohan/wikinitt/gravy/graph/model"
	"github.com/pranava-mohan/wikinitt/gravy/internal/articles"
	"github.com/pranava-mohan/wikinitt/gravy/internal/community"
	"github.com/pranava-mohan/wikinitt/gravy/internal/users"
)

func mapArticleToModel(a *articles.Article) *model.Article {
	if a == nil {
		return nil
	}
	description := a.Content
	runes := []rune(description)
	if len(runes) > 50 {
		description = string(runes[:50]) + "..."
	}

	return &model.Article{
		ID:          a.ID,
		Title:       a.Title,
		Content:     a.Content,
		Slug:        a.Slug,
		Category:    a.Category,
		Thumbnail:   a.Thumbnail,
		Featured:    a.Featured,
		Description: description,
		CreatedAt:   a.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:   a.UpdatedAt.Format("2006-01-02 15:04:05"),
		Author:      mapPublicUserToModel(a.Author),
	}
}

func mapPublicUserToModel(u *users.PublicUser) *model.PublicUser {
	if u == nil {
		return nil
	}
	return &model.PublicUser{
		ID:          u.ID,
		Name:        u.Name,
		Username:    u.Username,
		DisplayName: u.DisplayName,
		Gender:      u.Gender,
		Avatar:      u.Avatar,
	}
}

func mapUserToModel(u *users.User) *model.User {
	if u == nil {
		return nil
	}
	return &model.User{
		ID:            u.ID,
		Name:          u.Name,
		Username:      u.Username,
		DisplayName:   u.DisplayName,
		Email:         u.Email,
		Gender:        u.Gender,
		Avatar:        u.Avatar,
		PhoneNumber:   u.PhoneNumber,
		SetupComplete: u.SetupComplete,
		IsAdmin:       u.IsAdmin,
		IsBanned:      u.IsBanned,
		CreatedAt:     u.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func mapGroupToModel(g *community.Group, owner *users.PublicUser) *model.Group {
	if g == nil {
		return nil
	}
	return &model.Group{
		ID:           g.ID,
		Name:         g.Name,
		Description:  g.Description,
		Icon:         &g.Icon,
		Slug:         g.Slug,
		Type:         model.GroupType(g.Type),
		Owner:        mapPublicUserToModel(owner),
		MembersCount: int32(g.MembersCount),
		CreatedAt:    g.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func mapPostToModel(p *community.Post, author *users.PublicUser, group *community.Group, groupOwner *users.PublicUser) *model.Post {
	if p == nil {
		return nil
	}
	return &model.Post{
		ID:            p.ID,
		Title:         p.Title,
		Content:       p.Content,
		Author:        mapPublicUserToModel(author),
		Group:         mapGroupToModel(group, groupOwner),
		CommentsCount: int32(p.CommentsCount),
		Upvotes:       int32(p.UpvotesCount),
		Downvotes:     int32(p.DownvotesCount),
		CreatedAt:     p.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func mapCommentToModel(c *community.Comment, author *users.PublicUser, post *community.Post, postAuthor *users.PublicUser, group *community.Group, groupOwner *users.PublicUser) *model.Comment {
	if c == nil {
		return nil
	}
	return &model.Comment{
		ID:           c.ID,
		Content:      c.Content,
		Author:       mapPublicUserToModel(author),
		Post:         mapPostToModel(post, postAuthor, group, groupOwner),
		ParentID:     c.ParentID,
		Upvotes:      int32(c.UpvotesCount),
		Downvotes:    int32(c.DownvotesCount),
		RepliesCount: int32(c.RepliesCount),
		CreatedAt:    c.CreatedAt.Format("2006-01-02 15:04:05"),
	}
}

func mapUserToPublic(u *users.User) *users.PublicUser {
	if u == nil {
		return nil
	}
	return &users.PublicUser{
		ID:          u.ID,
		Name:        u.Name,
		Username:    u.Username,
		DisplayName: u.DisplayName,
		Gender:      u.Gender,
		Avatar:      u.Avatar,
	}
}
