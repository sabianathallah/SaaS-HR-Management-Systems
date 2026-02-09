import { ArticleCard, Article } from './ArticleCard';

interface ArticleGridProps {
  title?: string;
  articles: Article[];
}

export function ArticleGrid({ title, articles }: ArticleGridProps) {
  const [featured, ...regular] = articles;

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-3xl lg:text-4xl mb-10 pb-4 border-b border-gray-200">
            {title}
          </h2>
        )}

        {/* Featured Article */}
        {featured && (
          <div className="mb-12 lg:mb-16">
            <ArticleCard article={featured} featured />
          </div>
        )}

        {/* Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {regular.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
