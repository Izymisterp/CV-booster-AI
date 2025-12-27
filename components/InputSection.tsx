
import React, { useRef, useState } from 'react';
import { FileData } from '../types';

interface InputSectionProps {
  cv: string;
  setCv: (val: string) => void;
  cvFile: FileData | null;
  setCvFile: (file: FileData | null) => void;
  job: string;
  setJob: (val: string) => void;
  onProcess: () => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
  cv, setCv, cvFile, setCvFile, job, setJob, onProcess, isLoading 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputType, setInputType] = useState<'text' | 'url'>('text');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setCvFile({
        data: base64,
        mimeType: file.type,
        name: file.name
      });
      setCv(''); 
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-fadeIn">
      {/* CV Section */}
      <div className="flex flex-col h-full">
        <label className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-4">
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-file-invoice text-blue-600"></i>
            Votre CV actuel
          </span>
          {cvFile && (
            <button 
              onClick={() => setCvFile(null)}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-bold"
            >
              <i className="fa-solid fa-trash-can"></i> Supprimer
            </button>
          )}
        </label>
        
        {!cvFile ? (
          <div className="flex flex-col gap-4 h-full">
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                flex-shrink-0 cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3
                ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-200 hover:border-blue-400 bg-white shadow-sm'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,image/*"
              />
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">Déposez votre CV</p>
                <p className="text-xs text-slate-400 mt-1">PDF ou Image (Max 5Mo)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 py-2">
              <div className="h-px bg-slate-200 flex-grow"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">OU COLLEZ LE TEXTE</span>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>

            <textarea
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              placeholder="Collez ici le contenu textuel de votre CV..."
              className="flex-grow min-h-[200px] p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none shadow-sm text-sm bg-white"
            />
          </div>
        ) : (
          <div className="flex-grow bg-white border border-blue-100 rounded-2xl p-10 flex flex-col items-center justify-center gap-6 shadow-sm">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl rotate-3">
              <i className="fa-solid fa-file-pdf text-white text-4xl"></i>
            </div>
            <div className="text-center">
              <p className="font-black text-slate-900 text-lg mb-1">{cvFile.name}</p>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Document prêt pour l'IA</p>
            </div>
          </div>
        )}
      </div>

      {/* Job Description Section */}
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <i className="fa-solid fa-briefcase text-indigo-600"></i>
            L'offre d'emploi
          </label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
              onClick={() => setInputType('text')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${inputType === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
             >
               TEXTE
             </button>
             <button 
              onClick={() => setInputType('url')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${inputType === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
             >
               LIEN URL
             </button>
          </div>
        </div>

        {inputType === 'url' ? (
          <div className="flex-grow flex flex-col gap-4">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-6 min-h-[300px]">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <i className="fa-solid fa-link text-2xl"></i>
              </div>
              <div className="w-full space-y-2">
                <p className="text-sm font-bold text-slate-700 text-center">Collez le lien de l'annonce</p>
                <input 
                  type="url"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="https://linkedin.com/jobs/..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all shadow-inner"
                />
                <p className="text-[10px] text-slate-400 text-center italic">LinkedIn, Indeed, HelloWork, ou site carrière...</p>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-700 leading-relaxed">
                <i className="fa-solid fa-circle-info mr-2"></i>
                L'IA parcourra automatiquement la page pour en extraire les informations clés.
              </p>
            </div>
          </div>
        ) : (
          <textarea
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Copiez et collez ici le texte intégral de l'annonce..."
            className="flex-grow min-h-[400px] p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none shadow-sm text-sm bg-white"
          />
        )}
      </div>

      <div className="md:col-span-2 flex justify-center mt-12">
        <button
          onClick={onProcess}
          disabled={isLoading || (!cv.trim() && !cvFile) || !job.trim()}
          className={`
            px-12 py-5 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4
            ${isLoading 
              ? 'bg-slate-200 cursor-not-allowed text-slate-400' 
              : 'bg-slate-900 text-white shadow-2xl shadow-slate-200 hover:bg-black'}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
              Analyse en cours...
            </>
          ) : (
            <>
              <i className="fa-solid fa-wand-magic-sparkles text-blue-400"></i>
              Optimiser mon Profil
            </>
          )}
        </button>
      </div>
    </div>
  );
};
