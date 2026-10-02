export interface HelpQuestionRef {
  q: string;
  a: string;
}

export interface HelpTopicTranslation {
  id: string;
  icon: string;
  questions: HelpQuestionRef[];
}

export interface HelpTranslationNamespace {
  topics: HelpTopicTranslation[];
  [key: string]: unknown;
}
