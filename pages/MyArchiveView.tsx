
import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { myArchiveProfileAtom } from '../store/archive';
import { useLanguage } from '../hooks/useLanguage';
import { UsersIcon, ArrowRightIcon } from '../components/Icons';
import { UPLOADER_DATA } from './uploaderData';
import type { Profile, ArchiveItemSummary } from '../types';
import UploaderDetailView from './UploaderDetailView';
import { searchArchive } from '../services/archiveService';
import { Spinner } from '../components/Spinner';
import { ItemCard } from '../components/ItemCard';


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
    const [verificationData, setVerificationData] = useState<{ items: ArchiveItemSummary[], ids: string[] } | null>(null);
    const [selectedId, setSelectedId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = screenName.trim();
        if (!name) return;

        setStep('verifying');
        setError(null);
        
        try {
            const data = await searchArchive(`creator:("${name}") OR uploader:("${name}")`, 1, ['-downloads'], undefined, 8);
            if (data.response.numFound === 0) {
                setError(t('myArchive:connect.errorNotFound'));
                setStep('failed');
                return;
            }
            
            const uniqueUploaders: string[] = [...new Set(data.response.docs.map(d => d.uploader).filter((u): u is string => !!u))];
            
            setVerificationData({ items: data.response.docs, ids: uniqueUploaders });
            
            if (uniqueUploaders.length > 0) {
                setSelectedId(uniqueUploaders[0]);
            } else {
                 // Fallback if no uploader field is found, but creator matched. Use the screen name itself.
                setSelectedId(name);
            }
            setStep('confirming');
            
        } catch (err) {
            setError(t('common:error'));
            setStep('failed');
        }
    };

    const handleConfirmation = () => {
        if (!selectedId) return;

        const curatedData = UPLOADER_DATA.find(u => 
            u.username.toLowerCase() === screenName.toLowerCase() || 
            u.screenname?.toLowerCase() === screenName.toLowerCase() || 
            u.searchUploader.toLowerCase() === selectedId.toLowerCase()
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
    
    // Renders the main input form
    const renderInputStep = () => (
        <>
            <h1 className="text-3xl font-bold text-white">{t('myArchive:connect.title')}</h1>
            <p className="mt-2 text-gray-300">{t('myArchive:connect.description')}</p>
            <form onSubmit={handleInitialSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
                <input
                    value={screenName}
                    onChange={e => setScreenName(e.target.value)}
                    placeholder={t('myArchive:connect.placeholder')}
                    className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg py-3 px-4 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label={t('myArchive:connect.placeholder')}
                />
                <button
                    type="submit"
                    disabled={!screenName.trim()}
                    className="flex-shrink-0 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 px-6 text-lg rounded-lg transition-transform hover:scale-105 duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <span>{t('myArchive:connect.button')}</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">{t('myArchive:connect.privacy')}</p>
        </>
    );
    
    // Renders the confirmation step with sample items and identifier choices
    const renderConfirmStep = () => (
        <>
             <h1 className="text-2xl font-bold text-white">{t('myArchive:connect.confirmTitle')}</h1>
             <p className="mt-2 text-gray-300">{t('myArchive:connect.confirmDescription')}</p>
             
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                {verificationData?.items.map((item, index) => <ItemCard key={item.identifier} item={item} index={index} />)}
             </div>

             <div className="space-y-3 text-left max-w-md mx-auto">
                <p className="font-semibold text-gray-200">{t('myArchive:connect.selectIdentifier')}</p>
                {verificationData?.ids.map(id => (
                    <label key={id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700">
                        <input type="radio" name="uploaderId" value={id} checked={selectedId === id} onChange={() => setSelectedId(id)} className="w-5 h-5 text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500" />
                        <span className="font-mono text-sm text-white">{id}</span>
                    </label>
                ))}
                 {verificationData?.ids.length === 0 && (
                     <p className="text-sm text-gray-400 p-3 bg-gray-700/50 rounded-lg">{t('myArchive:connect.noIdentifierFound')}</p>
                 )}
            </div>

            <div className="flex justify-center gap-4 mt-8">
                <button onClick={handleReset} className="px-6 py-2 text-sm font-semibold text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg">{t('myArchive:connect.tryAgain')}</button>
                <button onClick={handleConfirmation} disabled={!selectedId} className="px-8 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg disabled:bg-gray-500">{t('myArchive:connect.confirmButton')}</button>
            </div>
        </>
    );

    const renderFailedStep = () => (
         <>
            <h1 className="text-2xl font-bold text-red-400">{t('myArchive:connect.errorTitle')}</h1>
            <p className="mt-2 text-gray-300">{error}</p>
            <button onClick={handleReset} className="mt-8 px-6 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg">{t('myArchive:connect.tryAgain')}</button>
        </>
    )

    return (
        <div className="text-center max-w-3xl mx-auto p-6 bg-gray-800/60 rounded-xl animate-fade-in">
            <UsersIcon className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            {step === 'input' && renderInputStep()}
            {step === 'verifying' && <Spinner size="lg" />}
            {step === 'confirming' && renderConfirmStep()}
            {step === 'failed' && renderFailedStep()}
        </div>
    );
};

interface MyArchiveViewProps {}

/**
 * The main component for the "My Archive" feature.
 * It manages the connection state and renders either the ConnectView
 * or the full UploaderDetailView as the user's personal dashboard.
 */
const MyArchiveView: React.FC<MyArchiveViewProps> = () => {
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