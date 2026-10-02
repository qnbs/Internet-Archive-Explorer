import type { View } from './app';
import type { UploaderTab } from './uploader';

export type Theme = 'light' | 'dark' | 'sepia' | 'system';
export type Language = 'en' | 'de';

export type AccentColor = 'cyan' | 'emerald' | 'rose' | 'violet';

export interface AppSettings {
  resultsPerPage: number;
  showExplorerHub: boolean;
  defaultSort: 'downloads' | 'week' | 'publicdate';
  rememberFilters: boolean;
  rememberSort: boolean;

  layoutDensity: 'comfortable' | 'compact';
  disableAnimations: boolean;
  accentColor: AccentColor;

  defaultView: View;
  defaultUploaderDetailTab: UploaderTab;
  defaultDetailTabAll: 'description' | 'files' | 'related';
  openLinksInNewTab: boolean;
  autoplayMedia: boolean;

  enableAiFeatures: boolean;
  autoArchiveAI: boolean;
  defaultAiTab: 'description' | 'ai';
  autoRunEntityExtraction: boolean;
  summaryTone: 'simple' | 'detailed' | 'academic';

  highContrastMode: boolean;
  underlineLinks: boolean;
  fontSize: 'sm' | 'base' | 'lg';
  scrollbarColor: string;
}
