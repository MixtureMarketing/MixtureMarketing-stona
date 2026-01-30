import { Palette, Code, Megaphone } from 'lucide-react';
import { SERVICES_CONTENT as CONTENT } from '../content';

// We map icons here to avoid serializing React components in JSON
const ICONS = {
  Code,
  Megaphone,
  Palette,
};

// Data structure for Services component
export const SERVICES_SECTION_DATA = [
  {
    ...CONTENT.items[0],
    icon: ICONS.Code,
    visualType: 'code',
  },
  {
    ...CONTENT.items[1],
    icon: ICONS.Megaphone,
    visualType: 'chart',
  },
  {
    ...CONTENT.items[2],
    icon: ICONS.Palette,
    visualType: 'ui',
  },
];
