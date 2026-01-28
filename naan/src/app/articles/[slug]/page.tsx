import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import FormattedDate from "@/components/FormattedDate";

const ARTICLES: Record<
  string,
  {
    title: string;
    category: string;
    createdAt: string;
    author: { name: string; avatar?: string };
    thumbnail?: string;
    content: string;
  }
> = {
  "nextjs-basics": {
    title: "Next.js Basics",
    category: "Web",
    createdAt: "2026-01-20",
    author: { name: "WikiNITT Team" },
    thumbnail: "/images/placeholder.png",
    content: `
# Next.js 
;lkl;k
;lkll
l;kl;kk;l
l;k;l
`,
  },
};

function rewriteInternalLinks(markdown: string) {
  return markdown.replace(/\]\((\/(?!\/)[^)]+)\)/g, "](\/articles$1)");
}

export default function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = ARTICLES[params.slug];

  if (!article) notFound();

  const content = rewriteInternalLinks(article.content);

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase bg-indigo-100 text-indigo-600 rounded-full">
        {article.category}
      </span>

      <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
        {article.title}
      </h1>

      <div className="flex items-center space-x-4 mb-8">
        {article.author.avatar ? (
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
            {article.author.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-lg font-medium">{article.author.name}</p>
          <p className="text-sm text-gray-500">
            <FormattedDate date={article.createdAt} />
          </p>
        </div>
      </div>

      {article.thumbnail && (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg mb-12">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkBreaks]}>
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
