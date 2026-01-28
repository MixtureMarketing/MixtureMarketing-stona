import { PortableTextBlock } from '@portabletext/types';

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  caption?: string;
}

export type SanityBody = PortableTextBlock[];

export interface SanitySlug {
  current: string;
  _type: 'slug';
}

export interface SanityReference {
  _ref: string;
  _type: 'reference';
}
