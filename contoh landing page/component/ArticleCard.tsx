import { ImageWithFallback } from './figma/ImageWithFallback';

export interface Article {
  id: number;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  if (featured) {
    return (
      <article className="group cursor-pointer">
        <div className="relative overflow-hidden mb-4 aspect-[4/3]">
          <ImageWithFallback
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
          {article.category}
        </div>
        <h3 className="text-3xl mb-3 leading-tight group-hover:text-gray-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.date}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="group cursor-pointer">
      <div className="relative overflow-hidden mb-3 aspect-[4/3]">
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
        {article.category}
      </div>
      <h3 className="text-xl mb-2 leading-tight group-hover:text-gray-600 transition-colors">
        {article.title}
      </h3>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{article.author}</span>
        <span>•</span>
        <span>{article.date}</span>
      </div>
    </article>
  );
}
