package articles

import (
	"context"
	"time"
	"strings"

	"github.com/pranava-mohan/wikinitt/gravy/internal/search"
	"github.com/pranava-mohan/wikinitt/gravy/internal/users"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Article struct {
	ID        string            `bson:"_id,omitempty"`
	Title     string            `bson:"title"`
	Content   string            `bson:"content"`
	Slug      string            `bson:"slug"`
	Category  string            `bson:"category"`
	Thumbnail string            `bson:"thumbnail"`
	Featured  bool              `bson:"featured"`
	AuthorID  string            `bson:"authorId"`
	CreatedAt time.Time         `bson:"createdAt"`
	UpdatedAt time.Time         `bson:"updatedAt"`
	Indexed   bool              `bson:"indexed"`
	Author    *users.PublicUser `bson:"-"`
}

type Repository interface {
	Create(ctx context.Context, article Article) (*Article, error)
	Update(ctx context.Context, id string, updates bson.M) (*Article, error)
	Delete(ctx context.Context, id string) error
	GetByID(ctx context.Context, id string) (*Article, error)
	GetByIDs(ctx context.Context, ids []string) ([]*Article, error)
	List(ctx context.Context, category *string, limit *int, offset *int, featured *bool) ([]*Article, error)
	ListUnindexed(ctx context.Context, limit int) ([]*Article, error)
	MarkIndexed(ctx context.Context, id string) error
	GetBySlug(ctx context.Context, slug string) (*Article, error)
	EnsureIndexes(ctx context.Context) error
	GetAllTitles(ctx context.Context) (map[string]string, error)
}

type repository struct {
	coll         *mongo.Collection
	searchClient *search.Client
}

func NewRepository(db *mongo.Database, searchClient *search.Client) Repository {
	return &repository{
		coll:         db.Collection("articles"),
		searchClient: searchClient,
	}
}

func (r *repository) Create(ctx context.Context, article Article) (*Article, error) {
	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()
	res, err := r.coll.InsertOne(ctx, article)
	if err != nil {
		return nil, err
	}
	article.ID = res.InsertedID.(bson.ObjectID).Hex()

	doc := map[string]interface{}{
		"id":        article.ID,
		"title":     article.Title,
		"content":   article.Content,
		"slug":      article.Slug,
		"category":  article.Category,
		"thumbnail": article.Thumbnail,
		"authorID":  article.AuthorID,
		"createdAt": article.CreatedAt.Unix(),
	}
	if err := r.searchClient.IndexArticle(ctx, doc); err == nil {
		_, _ = r.coll.UpdateOne(ctx, bson.M{"_id": res.InsertedID}, bson.M{"$set": bson.M{"indexed": true}})
		article.Indexed = true
	}
	return &article, nil
}

func (r *repository) Update(ctx context.Context, id string, updates bson.M) (*Article, error) {
	idObj, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	updates["updatedAt"] = time.Now()
	res := r.coll.FindOneAndUpdate(ctx, bson.M{"_id": idObj}, bson.M{"$set": updates})
	if res.Err() != nil {
		return nil, res.Err()
	}
	var article Article
	if err := res.Decode(&article); err != nil {
		return nil, err
	}

	updatedArticle, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	doc := map[string]interface{}{
		"id":        updatedArticle.ID,
		"title":     updatedArticle.Title,
		"content":   updatedArticle.Content,
		"slug":      updatedArticle.Slug,
		"category":  updatedArticle.Category,
		"thumbnail": updatedArticle.Thumbnail,
		"authorID":  updatedArticle.AuthorID,
		"createdAt": updatedArticle.CreatedAt.Unix(),
	}
	if err := r.searchClient.IndexArticle(ctx, doc); err == nil {
		_, _ = r.coll.UpdateOne(ctx, bson.M{"_id": idObj}, bson.M{"$set": bson.M{"indexed": true}})
		updatedArticle.Indexed = true
	}

	return updatedArticle, nil
}

func (r *repository) Delete(ctx context.Context, id string) error {
	idObj, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.coll.DeleteOne(ctx, bson.M{"_id": idObj})
	if err != nil {
		return err
	}

	// Delete from index
	return r.searchClient.DeleteArticle(ctx, id)
}

func (r *repository) GetByID(ctx context.Context, id string) (*Article, error) {
	var article Article
	idObj, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	err = r.coll.FindOne(ctx, bson.M{"_id": idObj}).Decode(&article)
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *repository) GetByIDs(ctx context.Context, ids []string) ([]*Article, error) {
	if len(ids) == 0 {
		return []*Article{}, nil
	}
	var oids []bson.ObjectID
	idMap := make(map[string]int)
	for i, id := range ids {
		if oid, err := bson.ObjectIDFromHex(id); err == nil {
			oids = append(oids, oid)
			idMap[id] = i
		}
	}

	cursor, err := r.coll.Find(ctx, bson.M{"_id": bson.M{"$in": oids}})
	if err != nil {
		return nil, err
	}
	var articles []*Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}

	orderedArticles := make([]*Article, len(ids))
	for _, a := range articles {
		if idx, ok := idMap[a.ID]; ok {
			orderedArticles[idx] = a
		}
	}

	var finalArticles []*Article
	for _, a := range orderedArticles {
		if a != nil {
			finalArticles = append(finalArticles, a)
		}
	}
	return finalArticles, nil
}

func (r *repository) List(ctx context.Context, category *string, limit *int, offset *int, featured *bool) ([]*Article, error) {
	filter := bson.M{}
	if category != nil {
		filter["category"] = *category
	}
	if featured != nil {
		filter["featured"] = *featured
	}

	opts := options.Find()
	if limit != nil {
		opts.SetLimit(int64(*limit))
	}
	if offset != nil {
		opts.SetSkip(int64(*offset))
	}
	opts.SetSort(bson.D{{Key: "createdAt", Value: -1}})

	cursor, err := r.coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	var articles []*Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (r *repository) ListUnindexed(ctx context.Context, limit int) ([]*Article, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"indexed": false},
			{"indexed": bson.M{"$exists": false}},
		},
	}
	opts := options.Find().SetLimit(int64(limit))
	cursor, err := r.coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	var articles []*Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (r *repository) MarkIndexed(ctx context.Context, id string) error {
	idObj, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.coll.UpdateOne(ctx, bson.M{"_id": idObj}, bson.M{"$set": bson.M{"indexed": true}})
	return err
}

func (r *repository) GetBySlug(ctx context.Context, slug string) (*Article, error) {
	var article Article
	err := r.coll.FindOne(ctx, bson.M{"slug": slug}).Decode(&article)
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *repository) EnsureIndexes(ctx context.Context) error {
	indices := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "slug", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{Keys: bson.D{{Key: "category", Value: 1}}},
		{Keys: bson.D{{Key: "featured", Value: 1}}},
		{Keys: bson.D{{Key: "createdAt", Value: -1}}},
		{Keys: bson.D{{Key: "indexed", Value: 1}}},
	}

	_, err := r.coll.Indexes().CreateMany(ctx, indices)
	return err
}

func (r *repository) GetAllTitles(ctx context.Context) (map[string]string, error) {
	// We only need title + slug, nothing else
	projection := bson.M{
		"title": 1,
		"slug":  1,
	}

	cursor, err := r.coll.Find(ctx, bson.M{}, options.Find().SetProjection(projection))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	titleToSlug := make(map[string]string)

	for cursor.Next(ctx) {
		var doc struct {
			Title string `bson:"title"`
			Slug  string `bson:"slug"`
		}

		if err := cursor.Decode(&doc); err != nil {
			return nil, err
		}

		// Normalize title for case-insensitive matching
		titleToSlug[strings.ToLower(doc.Title)] = doc.Slug
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return titleToSlug, nil
}
