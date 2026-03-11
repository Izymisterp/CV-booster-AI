
import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { ResultsSection } from './components/ResultsSection';
import { RefinementSection } from './components/RefinementSection';
import { InformationModal, ModalType } from './components/InformationModal';
import { AppStatus, AnalysisResult, FileData, RefinementData } from './types';
import { processApplication } from './services/geminiService';
import { fetchApplications, saveApplication } from './services/dbService';

// Utilitaire pour générer un UUID compatible
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const App: React.FC = () => {
  const [cv, setCv] = useState('');
  const [cvFile, setCvFile] = useState<FileData | null>(null);
  const [job, setJob] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);

  React.useEffect(() => {
    // Vérification basique de la clé API
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      setApiKeyError(true);
    }

    // Charger les données sauvegardées
    const loadHistory = async () => {
      try {
        // Essayer de charger depuis Supabase
        const dbHistory = await fetchApplications();
        if (dbHistory && dbHistory.length > 0) {
          setHistory(dbHistory);
          return;
        }
      } catch (err) {
        console.warn("Impossible de charger l'historique Supabase, repli sur localStorage", err);
      }

      // Repli sur localStorage si Supabase échoue ou est vide
      const savedHistory = localStorage.getItem('cv_booster_history');
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            setHistory(parsed);
          }
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    };

    loadHistory();
    
    const savedCv = localStorage.getItem('cv_booster_cv');
    const savedCvFile = localStorage.getItem('cv_booster_cv_file');
    const savedJob = localStorage.getItem('cv_booster_job');
    
    if (savedCv) setCv(savedCv);
    if (savedJob) setJob(savedJob);
    if (savedCvFile) {
      try {
        const parsedFile = JSON.parse(savedCvFile);
        if (parsedFile && parsedFile.data && parsedFile.mimeType) {
          setCvFile(parsedFile);
        }
      } catch (e) {
        console.error("Erreur parsing fichier CV sauvegardé", e);
      }
    }
  }, []);

  const [refinementData, setRefinementData] = useState<RefinementData>({
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    links: { linkedin: '', portfolio: '', github: '' },
    additionalExperience: ''
  });

  // Sauvegarder les données à chaque changement
  React.useEffect(() => {
    localStorage.setItem('cv_booster_cv', cv);
  }, [cv]);
  
  // Sauvegarder le fichier CV
  React.useEffect(() => {
    if (cvFile) {
      try {
        localStorage.setItem('cv_booster_cv_file', JSON.stringify(cvFile));
      } catch (e) {
        console.warn("Fichier trop volumineux pour localStorage");
      }
    }
  }, [cvFile]);

  React.useEffect(() => {
    localStorage.setItem('cv_booster_job', job);
  }, [job]);

  React.useEffect(() => {
    localStorage.setItem('cv_booster_history', JSON.stringify(history));
  }, [history]);

  const handleContinueToRefine = () => {
    setStatus(AppStatus.REFINING);
  };

  const handleFinalProcess = async (feedback?: string) => {
    setStatus(AppStatus.PROCESSING);
    setError(null);
    try {
      const data = await processApplication(cv, job, refinementData, cvFile || undefined, feedback);
      
      // Ajouter un ID et une date
      const resultWithMeta = {
        ...data,
        id: generateUUID(),
        createdAt: Date.now(),
        originalCVContent: cv,
        originalJobDescription: job
      };
      
      setResult(resultWithMeta);
      setHistory(prev => [resultWithMeta, ...prev]);

      // Sauvegarde asynchrone dans Supabase
      saveApplication(resultWithMeta).catch(err => {
        console.error("Erreur de sauvegarde Supabase", err);
        // Ne bloque pas l'UI, l'utilisateur a toujours son résultat local
      });
      
      setStatus(AppStatus.COMPLETED);
      // On scroll en haut pour voir le résultat
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
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
    setJob('');
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
          <nav className="flex gap-6 text-sm font-semibold text-slate-600">
            <button 
              type="button" 
              onClick={() => { setActiveTab('generate'); setStatus(AppStatus.IDLE); setResult(null); }} 
              className={`transition-colors flex items-center gap-2 ${activeTab === 'generate' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              Générateur
            </button>
            <button 
              type="button" 
              onClick={() => { setActiveTab('history'); setStatus(AppStatus.IDLE); }} 
              className={`transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              Historique
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-12">
        {apiKeyError && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3 text-yellow-800 animate-bounce-in">
            <i className="fa-solid fa-key text-yellow-600"></i>
            <div>
              <p className="font-bold">Clé API manquante ou invalide</p>
              <p className="text-sm">Veuillez configurer votre clé API Gemini dans le fichier <code className="bg-yellow-100 px-1 rounded">.env</code> pour utiliser l'application.</p>
            </div>
          </div>
        )}

        {activeTab === 'history' ? (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-folder-open text-blue-600"></i>
              Mes Candidatures
            </h2>
            
            {history.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-box-open text-slate-300 text-2xl"></i>
                </div>
                <p className="text-slate-500 font-medium">Aucune candidature sauvegardée pour le moment.</p>
                <button 
                  onClick={() => setActiveTab('generate')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  Créer ma première candidature
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {history.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{item.improvedCV.professionalTitle}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <i className="fa-regular fa-calendar"></i>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date inconnue'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                           Score ATS : {item.atsScore || '?'}%
                         </span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-600 border border-slate-100">
                      <p className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Entreprise / Poste</p>
                      <p className="line-clamp-2">{item.improvedCV.experiences[0]?.company || 'Non spécifié'} - {item.improvedCV.experiences[0]?.position}</p>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setResult(item);
                          setActiveTab('generate');
                          setStatus(AppStatus.COMPLETED);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-eye"></i>
                        Voir le dossier complet
                      </button>
                      <button
                        onClick={() => {
                          setActiveModal({ type: 'details', data: item });
                        }}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-circle-info"></i>
                        Détails source
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
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
              Utilisez l'IA pour adapter votre parcours aux attentes précises des recruteurs.
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
            onConfirm={() => handleFinalProcess()}
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
          <ResultsSection 
            result={result} 
            history={history}
            onSelectHistory={(item) => setResult(item)}
            onReset={handleResetAll} 
            onNewJob={handleNewJob} 
            onRegenerate={handleFinalProcess} 
          />
        )}

        {status === AppStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <i className="fa-solid fa-brain text-blue-600 text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">L'IA travaille sur votre dossier...</h3>
              <p className="text-slate-500">Mise en page, rédaction et optimisation en cours.</p>
            </div>
          </div>
        )}
        </>
      )}
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200 no-print">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <i className="fa-solid fa-rocket text-white text-xs"></i>
             </div>
             <span className="font-bold text-lg text-slate-900">CV Booster AI</span>
          </div>
          <p className="text-xs text-slate-400">
            © 2024 CV Booster AI. Vos données sont traitées en temps réel et ne sont pas stockées.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
