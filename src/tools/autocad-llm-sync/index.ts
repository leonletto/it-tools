import { FileCode } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.autocad-llm-sync.title'),
  path: '/autocad-llm-sync',
  description: translate('tools.autocad-llm-sync.description'),
  keywords: ['autocad', 'dxf', 'cad', 'llm', 'ai', 'json', 'scr', 'drawing', 'sync'],
  component: () => import('./autocad-llm-sync.vue'),
  icon: FileCode,
});

