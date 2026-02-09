import { ImageWithFallback } from './figma/ImageWithFallback';

interface HeroProps {
  image: string;
  category: string;
  title: string;
  description: string;
}

export function Hero({ image, category, title, description }: HeroProps) {
  return (
    <section className="relative h-[70vh] lg:h-[85vh] overflow-hidden group cursor-pointer">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end pb-12 lg:pb-20">
        <div className="max-w-3xl text-white">
          <div className="text-sm uppercase tracking-wider mb-3 opacity-90">
            {category}
          </div>
          <h2 className="text-4xl lg:text-6xl mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-lg opacity-90 mb-6 line-clamp-2">
            {description}
          </p>
          <button className="text-sm uppercase tracking-wide border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors">
            Read More
          </button>
        </div>
      </div>
    </section>
  );
}
