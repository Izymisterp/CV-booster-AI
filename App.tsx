
import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { ResultsSection } from './components/ResultsSection';
import { RefinementSection } from './components/RefinementSection';
import { InformationModal, ModalType } from './components/InformationModal';
import { AppStatus, AnalysisResult, FileData, RefinementData } from './types';
import { processApplication } from './services/geminiService';

const App: React.FC = () => {
  const [cv, setCv] = useState('');
  const [cvFile, setCvFile] = useState<FileData | null>(null);
  const [job, setJob] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [refinementData, setRefinementData] = useState<RefinementData>({
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    links: { linkedin: '', portfolio: '', github: '' },
    additionalExperience: ''
  });

  const handleContinueToRefine = () => {
    setStatus(AppStatus.REFINING);
  };

  const handleFinalProcess = async () => {
    setStatus(AppStatus.PROCESSING);
    setError(null);
    try {
      const data = await processApplication(cv, job, refinementData, cvFile || undefined);
      setResult(data);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleResetAll = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setCv('');
    setCvFile(null);
    setJob('');
    setRefinementData({
      fullName: '',
      professionalTitle: '',
      email: '',
      phone: '',
      location: '',
      links: { linkedin: '', portfolio: '', github: '' },
      additionalExperience: ''
    });
  };

  const handleNewJob = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setJob(''); // On vide seulement l'offre
    // Le CV et les données de raffinement sont conservés
  };

  const handleGoBack = () => {
    setStatus(AppStatus.IDLE);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <InformationModal type={activeModal} onClose={() => setActiveModal(null)} />

      {/* Header */}
      <header className="py-6 px-6 no-print border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <i className="fa-solid fa-rocket text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">CV BOOSTER AI</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Intelligence RH</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
            <button type="button" onClick={() => setActiveModal('guide')} className="hover:text-blue-600 transition-colors">Comment ça marche ?</button>
            <button type="button" onClick={() => setActiveModal('guide')} className="hover:text-blue-600 transition-colors">Conseils RH</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12">
        {status === AppStatus.IDLE && (
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fadeIn">
            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-6 inline-block">
              Propulsez votre carrière
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Ne postulez plus au hasard, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">optimisez votre succès.</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Utilisez l'IA pour adapter votre parcours aux attentes précises des recruteurs. Téléchargez votre CV pour commencer.
            </p>
            
            {(cv || cvFile) && (
               <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 animate-fadeIn">
                 <i className="fa-solid fa-check-circle"></i>
                 Votre CV est actuellement mémorisé
               </div>
            )}
          </div>
        )}

        {status === AppStatus.IDLE && (
          <InputSection 
            cv={cv} 
            setCv={setCv} 
            cvFile={cvFile}
            setCvFile={setCvFile}
            job={job} 
            setJob={setJob} 
            onProcess={handleContinueToRefine} 
            isLoading={false}
          />
        )}

        {status === AppStatus.REFINING && (
          <RefinementSection 
            data={refinementData}
            setData={setRefinementData}
            onConfirm={handleFinalProcess}
            onBack={handleGoBack}
          />
        )}

        {status === AppStatus.ERROR && (
          <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 mb-8 flex items-start gap-4 animate-shake">
            <i className="fa-solid fa-triangle-exclamation text-xl mt-1"></i>
            <div>
              <p className="font-bold">Oups ! Une erreur s'est produite.</p>
              <p className="text-sm mb-4">{error}</p>
              <button onClick={() => setStatus(AppStatus.IDLE)} className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-all">
                Réessayer
              </button>
            </div>
          </div>
        )}

        {status === AppStatus.COMPLETED && result && (
          <ResultsSection result={result} onReset={handleResetAll} onNewJob={handleNewJob} />
        )}

        {status === AppStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <i className="fa-solid fa-brain text-blue-600 text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">L'IA génère votre dossier final...</h3>
              <p className="text-slate-500">Mise en page, rédaction de la lettre et optimisation sémantique en cours.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200 no-print">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <i className="fa-solid fa-rocket text-white text-xs"></i>
               </div>
               <span className="font-bold text-lg text-slate-900">CV Booster AI</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              La solution intelligente pour les chercheurs d'emploi modernes. Optimisé par les derniers modèles de langage pour un résultat professionnel.
            </p>
          </div>
          <div className="col-span-1">
            <h4 className="font-bold mb-4 text-slate-900">Ressources</h4>
            <ul className="text-slate-500 text-sm space-y-2 flex flex-col items-start">
              <li><button type="button" onClick={() => setActiveModal('guide')} className="hover:text-blue-600 transition-colors text-left font-medium">Guide de l'entretien</button></li>
              <li><button type="button" onClick={() => setActiveModal('ats')} className="hover:text-blue-600 transition-colors text-left font-medium">Mots-clés ATS</button></li>
              <li><button type="button" onClick={() => setActiveModal('models')} className="hover:text-blue-600 transition-colors text-left font-medium">Modèles de CV</button></li>
            </ul>
          </div>
          <div className="col-span-1">
             <h4 className="font-bold mb-4 text-slate-900">Légal</h4>
             <p className="text-xs text-slate-400">
               © 2024 CV Booster AI. Vos données sont traitées uniquement pour la génération de vos documents et ne sont pas stockées.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
