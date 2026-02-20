'use client';

import { useCallback, useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { sportPhotos } from '@/lib/sportPhotos';
import { cn } from '@/lib/utils';

export default function AuthCarouselPanel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, onSelect]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-900">
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/[0.03] anim-drift" />
        <div className="absolute bottom-1/4 -left-16 w-48 h-48 rounded-full bg-white/[0.04] anim-float" />
        <div
          className="absolute top-1/3 right-10 w-24 h-24 rounded-2xl rotate-12 bg-white/[0.03] anim-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Grain texture */}
      <div className="landing-grain absolute inset-0 z-10 pointer-events-none" />

      {/* Brand logo overlay */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2.5 group"
      >
        <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/20 group-hover:bg-white/25 transition-colors">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <span className="font-display text-lg font-bold tracking-tight text-white drop-shadow-md">
          CC: Sporting Events
        </span>
      </Link>

      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: 'start' }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
          }),
        ]}
        className="h-full [&>div]:h-full"
      >
        <CarouselContent className="-ml-0 h-full [&>div]:h-full">
          {sportPhotos.map((photo, index) => (
            <CarouselItem key={photo.sport} className="pl-0 h-full min-h-0">
              <div className="relative h-full w-full min-h-0">
                <img
                  src={photo.image}
                  alt={photo.sport}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                {/* Sport name + subtitle at bottom */}
                <div className="absolute bottom-20 left-6 right-6 z-10">
                  <h3 className="font-display text-3xl font-extrabold text-white mb-1.5 drop-shadow-lg">
                    {photo.sport}
                  </h3>
                  <p className="text-white/70 text-sm font-medium">
                    {photo.subtitle}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1.5">
        {Array.from({ length: Math.min(count, 20) }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              'rounded-full transition-all duration-300',
              index === current
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
