/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Search,
  Tag,
  Hash,
  Clock,
  Database,
  Megaphone,
  Palette,
  Code2,
  TrendingUp,
} from 'lucide-react';

import AmbientBackground from '../common/AmbientBackground';
import SectionHeader from '../common/SectionHeader';
import BaseCard from '../common/BaseCard';
import Button from '../common/Button';
import Image from '../common/Image';
import Breadcrumbs from '../common/Breadcrumbs';
import Seo from '../common/Seo';
import Container from '../common/Container';

import { Article } from '../../types';
import { KNOWLEDGE_BASE_CONTENT as CONTENT } from '../../data/content';
import { useKnowledgeSearch } from '@/hooks/useKnowledgeSearch';
import { formatDate } from '@/utils/date';

// Categories Configuration
const CATEGORIES = [
  { id: 'all', icon: Hash },
  { id: 'tech', icon: Code2 },
  { id: 'marketing', icon: Megaphone },
  { id: 'design', icon: Palette },
  { id: 'analytics', icon: TrendingUp },
  { id: 'business', icon: Database },
].map((cat) => ({
  ...cat,
  label: CONTENT.categories.find((c) => c.id === cat.id)?.label || '',
}));

const KnowledgeBase = () => {
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filteredArticles,
    loading,
  } = useKnowledgeSearch();

  return (
    <div className="min-h-screen bg-light-gray text-dark selection:bg-primary/30 font-sans">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Baza Wiedzy', item: '/baza-wiedzy' },
        ]}
      />

      <AmbientBackground />

      <div className="pt-24 pb-16 relative z-10">
        <Container>
          <Breadcrumbs />

          {/* Header Section */}
          <div className="text-center mb-16 mt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
              <BookOpen size={14} /> {CONTENT.header.badge}
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark tracking-tight leading-tight">
              {CONTENT.header.title.line1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-secondary">
                {CONTENT.header.title.line2}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              {CONTENT.header.subtitle}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl p-2 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <div className="pl-4 text-gray-700">
                  <Search size={22} aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder={CONTENT.search.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-dark placeholder-gray-500 px-4 py-3 text-lg"
                  aria-label="Szukaj w bazie wiedzy"
                />
                <Button
                  className="hidden sm:flex shadow-none"
                  size="md"
                  aria-label="Uruchom wyszukiwanie"
                >
                  {CONTENT.search.button}
                </Button>
              </div>
            </div>
          </div>

          {/* Categories Navigation */}
          <nav
            className="mb-12 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
            aria-label="Kategorie artykułów"
          >
            <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-3 min-w-max sm:min-w-0">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    aria-pressed={isActive}
                    aria-label={`Filtruj artykuły: ${cat.label}`}
                    className={`
                      flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border
                      ${
                        isActive
                          ? 'bg-dark text-white border-dark shadow-lg shadow-[#213261]/20 scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-dark hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={16} className={isActive ? 'text-primary' : ''} aria-hidden="true" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <SectionHeader
            title={
              activeCategory === 'all'
                ? CONTENT.grid.newest
                : `${CONTENT.grid.categoryPrefix} ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`
            }
            subtitle="Eksploruj"
            align="left"
            className="mb-8"
          />

          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl h-96 animate-pulse border border-gray-100"
                ></div>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [content-visibility:auto] [contain-intrinsic-size:1px_1500px]">
              {filteredArticles.map((article) => (
                <BaseCard
                  key={article.id}
                  padding="none"
                  hover="lift"
                  className="flex flex-col h-full group overflow-hidden border-gray-200/50 hover:border-primary/50"
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xxs font-bold uppercase tracking-wide text-dark shadow-sm flex items-center gap-1">
                        <Tag size={10} className="text-accent-dark" aria-hidden="true" />{' '}
                        {article.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow relative">
                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-700 mb-4 border-b border-gray-100 pb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-accent-dark" aria-hidden="true" />{' '}
                        {article.readTime}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>{formatDate(article.date)}</span>
                    </div>

                    <Link
                      to={article.slug}
                      className="group-hover:text-secondary transition-colors"
                      aria-label={`Przejdź do artykułu: ${article.title}`}
                    >
                      <h3 className="text-xl font-bold text-dark mb-3 leading-snug line-clamp-2 group-hover:underline decoration-primary decoration-2 underline-offset-4">
                        {article.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">
                      {article.description}
                    </p>

                    {/* Tags & Action */}
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xxs font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <Link to={article.slug} aria-label={`Czytaj więcej: ${article.title}`}>
                        <button
                          className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-all duration-300 group-hover:scale-110"
                          aria-hidden="true"
                          tabIndex={-1}
                        >
                          <ArrowRight size={18} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </BaseCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-2">{CONTENT.grid.notFound.title}</h3>
              <p className="text-gray-700">{CONTENT.grid.notFound.desc}</p>
              <Button
                variant="outline"
                className="mt-6 border-gray-200 hover:border-primary"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
              >
                {CONTENT.grid.notFound.button}
              </Button>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default KnowledgeBase;
