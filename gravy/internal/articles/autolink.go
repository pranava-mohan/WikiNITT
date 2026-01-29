package articles

import (
	"context"
	"regexp"
	"sort"
)

// AutoLinkContent replaces article titles found in content with "title (slug)"
func AutoLinkContent(ctx context.Context, content string, repo Repository, currentSlug string) (string, error) {
	// Get all titles once
	titleToSlug, err := repo.GetAllTitles(ctx)
	if err != nil {
		return content, err
	}

	// Sort titles by length (longest first)
	titles := make([]string, 0, len(titleToSlug))
	for title := range titleToSlug {
		titles = append(titles, title)
	}
	sort.Slice(titles, func(i, j int) bool {
		return len(titles[i]) > len(titles[j])
	})

	result := content

	for _, title := range titles {
		slug := titleToSlug[title]

		if (slug == currentSlug) {
			continue
		}

		// Regex for whole-word, case-insensitive match
		pattern := `(?i)\b` + regexp.QuoteMeta(title) + `\b`
		re := regexp.MustCompile(pattern)

		result = re.ReplaceAllStringFunc(result, func(match string) string {
			return match + " (" + slug + ")"
		})
	}

	return result, nil
}
