import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import BaseCard from '../common/BaseCard';
import Image from '../common/Image';
import Container from '../common/Container';
import { cmsService } from '@/services/cmsService';
import { Article } from '../../types';
import { KNOWLEDGE_BASE_CONTENT as CONTENT } from '../../data/content';

const KnowledgeBaseTeaser: React.FC = () => {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);

  useEffect(() => {
    cmsService.getArticles().then((data) => {
      setLatestArticles(data.filter((a) => a.isFeatured).slice(0, 3));
    });
  }, []);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <Container className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl text-left">
            <SectionHeader
              align="left"
              title={CONTENT.teaser.title}
              description={CONTENT.teaser.description}
            />
          </div>
          <Link to="/baza-wiedzy/">
            <Button variant="outline" icon={<ArrowRight size={18} />}>
              {CONTENT.teaser.button}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestArticles.map((article, index) => (
            <AnimateOnScroll
              key={article.id}
              delay={index * 100}
              className={index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}
            >
              <Link
                to={article.slug}
                className="group block h-full"
                aria-label={`Czytaj artykuł: ${article.title}`}
              >
                <BaseCard
                  variant="solid"
                  padding="none"
                  hover="lift"
                  className="flex flex-col h-full overflow-hidden border-gray-100 group-hover:border-primary transition-all duration-500"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      width={600}
                      height={400}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-wider text-dark shadow-sm flex items-center gap-1.5">
                        <Tag size={10} className="text-accent-dark" aria-hidden="true" />{' '}
                        {article.categoryLabel}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xxs font-bold text-gray-600 uppercase tracking-widest mb-4">
                      <Clock size={12} className="text-accent-dark" aria-hidden="true" />{' '}
                      {article.readTime} czytania
                    </div>
                    <h3 className="text-lg font-bold text-dark mb-4 group-hover:text-secondary transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-2 text-sm font-bold text-accent-dark group-hover:gap-3 transition-all">
                      Czytaj dalej <ArrowRight size={16} />
                    </div>
                  </div>
                </BaseCard>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default KnowledgeBaseTeaser;
