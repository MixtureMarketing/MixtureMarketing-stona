import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { SanityImage } from '@/types/sanity';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/services/cmsService';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

interface CaseStudyGalleryProps {
  gallery: SanityImage[];
  onAssetClick: (asset: SanityImage) => void;
}

const CaseStudyGallery: React.FC<CaseStudyGalleryProps> = ({ gallery, onAssetClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-16">
      {gallery.map((img: SanityImage, i: number) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          key={i}
          className={`rounded-3xl overflow-hidden shadow-lg cursor-pointer group ${
            i % 3 === 0 ? 'md:col-span-2' : ''
          }`}
          onClick={() => onAssetClick(img)}
        >
          <div className="overflow-hidden relative">
            <img
              src={urlFor(img).width(1200).url()}
              alt={`Galeria ${i}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="text-white drop-shadow-md" size={32} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CaseStudyGallery;
