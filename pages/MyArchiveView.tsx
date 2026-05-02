import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { ContentCarousel } from '@/components/ContentCarousel';
import { ArrowRightIcon, UsersIcon } from '@/components/Icons';
import { Spinner } from '@/components/Spinner';
import { useLanguage } from '@/hooks/useLanguage';
import { searchArchive } from '@/services/archiveService';
import { myArchiveProfileAtom } from '@/store/archive';
import type { ArchiveItemSummary, Profile } from '@/types';
import UploaderDetailView from './UploaderDetailView';
import { UPLOADER_DATA } from './uploaderData';

/**
 * A self-contained component for the user to connect their public
 * Internet Archive profile to the "My Archive" dashboard.
 * This has been updated with a multi-stage verification flow.
 */
const ConnectView: React.FC<{ onConnect: (profile: Profile) => void }> = ({ onConnect }) => {
  const { t } = useLanguage();

  type Step = 'input' | 'verifying' | 'confirming' | 'failed';
  const [step, setStep] = useState<Step>('input');
  const [screenName, setScreenName] = useState('');
  const [verificationData, setVerificationData] = useState<{
    items: ArchiveItemSummary[];
    ids: string[];
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = screenName.trim();
    if (!name) return;

    setStep('verifying');
    setError(null);

    try {
      const data = await searchArchive(
        `creator:("${name}") OR uploader:("${name}")`,
        1,
        ['-downloads'],
        undefined,
        8,
      );
      if (data.response.numFound === 0) {
        setError(t('myArchive:connect.errorNotFound'));
        setStep('failed');
        return;
      }

      const uniqueUploaders: string[] = [
        ...new Set(data.response.docs.map((d) => d.uploader).filter((u): u is string => !!u)),
      ];

      setVerificationData({ items: data.response.docs, ids: uniqueUploaders });

      if (uniqueUploaders.length > 0) {
        setSelectedId(uniqueUploaders[0]);
      } else {
        // Fallback if no uploader field is found, but creator matched. Use the screen name itself.
        setSelectedId(name);
      }
      setStep('confirming');
    } catch {
      setError(t('common:error'));
      setStep('failed');
    }
  };

  const handleConfirmation = () => {
    if (!selectedId) return;

    const curatedData = UPLOADER_DATA.find(
      (u) =>
        u.username.toLowerCase() === screenName.toLowerCase() ||
        u.screenname?.toLowerCase() === screenName.toLowerCase() ||
        u.searchUploader.toLowerCase() === selectedId.toLowerCase(),
    );

    const profile: Profile = {
      name: curatedData?.username || screenName,
      searchIdentifier: selectedId,
      type: 'uploader',
      curatedData: curatedData,
    };
    onConnect(profile);
  };

  const handleReset = () => {
    setScreenName('');
    setStep('input');
    setError(null);
    setVerificationData(null);
  };

  const privacyId = 'my-archive-connect-privacy';

  // Renders the main input form
  const renderInputStep = () => (
    <>
      <h1 className="text-3xl font-bold text-white">{t('myArchive:connect.title')}</h1>
      <p className="mt-2 text-gray-300">{t('myArchive:connect.description')}</p>
      <form
        onSubmit={handleInitialSubmit}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        aria-describedby={privacyId}
      >
        <input
          value={screenName}
          onChange={(e) => setScreenName(e.target.value)}
          placeholder={t('myArchive:connect.placeholder')}
          className="flex-grow rounded-lg border-2 border-gray-600 bg-gray-700 px-4 py-3 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 motion-reduce:transition-none"
          aria-label={t('myArchive:connect.placeholder')}
          autoComplete="username"
        />
        <button
          type="submit"
          disabled={!screenName.trim()}
          className="flex flex-shrink-0 items-center justify-center rounded-lg bg-accent-600 px-6 py-3 text-lg font-semibold text-white transition-transform duration-300 hover:scale-105 hover:bg-accent-500 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-gray-500 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <span>{t('myArchive:connect.button')}</span>
          <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden />
        </button>
      </form>
      <p id={privacyId} className="mt-4 text-xs text-gray-500">
        {t('myArchive:connect.privacy')}
      </p>
    </>
  );

  // Renders the confirmation step with sample items and identifier choices
  const renderConfirmStep = () => (
    <>
      <h1 className="text-2xl font-bold text-white">{t('myArchive:connect.confirmTitle')}</h1>
      <p className="mt-2 text-gray-300">{t('myArchive:connect.confirmDescription')}</p>

      <div className="my-6">
        <ContentCarousel
          title={t('myArchive:connect.confirmTitle')}
          hideTitle={true}
          items={verificationData?.items || []}
          isLoading={false}
          error={null}
          cardAspectRatio="portrait"
        />
      </div>

      <div className="space-y-3 text-left max-w-md mx-auto">
        <p className="font-semibold text-gray-200">{t('myArchive:connect.selectIdentifier')}</p>
        {verificationData?.ids.map((id) => (
          <label
            key={id}
            className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700"
          >
            <input
              type="radio"
              name="uploaderId"
              value={id}
              checked={selectedId === id}
              onChange={() => setSelectedId(id)}
              className="h-5 w-5 border-gray-500 bg-gray-600 text-accent-600 focus:ring-accent-500"
            />
            <span className="font-mono text-sm text-white">{id}</span>
          </label>
        ))}
        {verificationData?.ids.length === 0 && (
          <p className="text-sm text-gray-400 p-3 bg-gray-700/50 rounded-lg">
            {t('myArchive:connect.noIdentifierFound')}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg bg-gray-700 px-6 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-600"
        >
          {t('myArchive:connect.tryAgain')}
        </button>
        <button
          type="button"
          onClick={handleConfirmation}
          disabled={!selectedId}
          className="rounded-lg bg-accent-600 px-8 py-2 text-sm font-semibold text-white hover:bg-accent-500 disabled:bg-gray-500"
        >
          {t('myArchive:connect.confirmButton')}
        </button>
      </div>
    </>
  );

  const renderFailedStep = () => (
    <>
      <h1 className="text-2xl font-bold text-red-400">{t('myArchive:connect.errorTitle')}</h1>
      <p className="mt-2 text-gray-300" role="alert">
        {error}
      </p>
      <button
        type="button"
        onClick={handleReset}
        className="mt-8 rounded-lg bg-accent-600 px-6 py-2 text-sm font-semibold text-white hover:bg-accent-500"
      >
        {t('myArchive:connect.tryAgain')}
      </button>
    </>
  );

  return (
    <div className="mx-auto max-w-4xl animate-fade-in rounded-xl bg-gray-800/60 p-6 text-center motion-reduce:animate-none">
      <UsersIcon className="mx-auto mb-4 h-16 w-16 text-accent-400" aria-hidden />
      {step === 'input' && renderInputStep()}
      {step === 'verifying' && (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="flex flex-col items-center gap-3 py-8"
        >
          <span className="sr-only">{t('common:loading')}</span>
          <Spinner size="lg" />
        </div>
      )}
      {step === 'confirming' && renderConfirmStep()}
      {step === 'failed' && renderFailedStep()}
    </div>
  );
};

/**
 * The main component for the "My Archive" feature.
 * It manages the connection state and renders either the ConnectView
 * or the full UploaderDetailView as the user's personal dashboard.
 */
const MyArchiveView: React.FC = () => {
  const [profile, setProfile] = useAtom(myArchiveProfileAtom);

  // If a profile is connected, render the unified UploaderDetailView.
  // This is the core of the refactor: using the same powerful "engine"
  // for both public profiles and the user's own archive view.
  if (profile) {
    return (
      <div className="animate-page-fade-in">
        <UploaderDetailView
          profile={profile}
          // The 'onBack' handler here serves as the "Disconnect" or "Switch User" function.
          onBack={() => setProfile(null)}
          isMyArchiveView={true}
        />
      </div>
    );
  }

  // If no profile is connected, render the ConnectView.
  return (
    <div className="animate-page-fade-in flex items-center justify-center min-h-[60vh]">
      <ConnectView onConnect={setProfile} />
    </div>
  );
};

export default MyArchiveView;
