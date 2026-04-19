import React from 'react';
import { HelpContent } from '@/components/help/HelpContent';
import { HelpHeader } from '@/components/help/HelpHeader';
import { HelpSearchBar } from '@/components/help/HelpSearchBar';
import { HelpSidebar } from '@/components/help/HelpSidebar';
import { HelpViewProvider } from '@/contexts/HelpViewContext';

const HelpViewLayout: React.FC = () => {
  return (
    <div className="space-y-8 animate-page-fade-in">
      <HelpHeader />
      <HelpSearchBar />
      <div className="flex flex-col md:flex-row gap-8">
        <HelpSidebar />
        <HelpContent />
      </div>
    </div>
  );
};

const HelpView: React.FC = () => {
  return (
    <HelpViewProvider>
      <HelpViewLayout />
    </HelpViewProvider>
  );
};

export default HelpView;
