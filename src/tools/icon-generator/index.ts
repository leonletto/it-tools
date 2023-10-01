import {BrandHtml5} from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Icon Generator',
  path: '/icon-generator',
  description: 'Convert a jpg/png/svg to a app icon, favicon, etc.',
  keywords: ['icon', 'image', 'generator', 'favicon'],
  component: () => import('./icon-generator.vue'),
  icon: BrandHtml5,
});
