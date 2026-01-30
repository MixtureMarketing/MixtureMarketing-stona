import { client, urlFor } from './cms/client';
import { articleService } from './cms/articleService';
import { caseStudyService } from './cms/caseStudyService';
import { pseoService } from './cms/pseoService';
import { configService } from './cms/configService';

export { client, urlFor };
export * from './cms/articleService';
export * from './cms/pseoService';
export * from './cms/configService';

export const cmsService = {
  ...articleService,
  ...caseStudyService,
  ...pseoService,
  ...configService,
};
