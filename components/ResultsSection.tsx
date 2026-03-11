import React, { useState, useEffect } from 'react';
import { AnalysisResult, StructuredCV } from '../types';

interface ResumeTemplateProps {
  cv: StructuredCV;
  hiddenIndices?: number[];
  hiddenCompactIndices?: number[];
  onToggle?: (index: number) => void;
  onToggleCompact?: (index: number) => void;
}

interface ResultsSectionProps {
  result: AnalysisResult;
  history?: AnalysisResult[];
  onSelectHistory?: (item: AnalysisResult) => void;
  onReset: () => void;
  onNewJob: () => void;
  onRegenerate: (feedback: string) => void;
}

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ cv, hiddenIndices = [], hiddenCompactIndices = [], onToggle, onToggleCompact }) => (
  <div className="bg-white text-slate-900 shadow-2xl mx-auto flex min-h-[1050px] print-container w-full max-w-[800px] overflow-hidden" id="cv-printable">
    {/* Left Column (Sidebar) */}
    <div className="w-[260px] md:w-[280px] bg-slate-900 text-white p-8 flex flex-col gap-10 shrink-0">
      <div className="mb-4">
        <h1 className="text-3xl font-black leading-none uppercase tracking-tighter mb-2 text-white">{cv.fullName}</h1>
        <div className="h-1.5 w-12 bg-blue-500 mb-3"></div>
        <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.15em] leading-snug">{cv.professionalTitle}</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] border-b border-slate-700 pb-2 text-slate-500">Contact</h3>
        <ul className="text-[11px] space-y-4 font-normal">
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-envelope text-blue-400 text-[10px]"></i>
            </div>
            <span className="break-all opacity-90">{cv.contact.email}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-phone text-blue-400 text-[10px]"></i>
            </div>
            <span className="opacity-90">{cv.contact.phone}</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-location-dot text-blue-400 text-[10px]"></i>
            </div>
            <span className="opacity-90">{cv.contact.location}</span>
          </li>
        </ul>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] border-b border-slate-700 pb-2 text-slate-500">Expertises</h3>
        <div className="flex flex-wrap gap-2">
          {cv.skills.map((skill, i) => (
            <span key={i} className="px-2.5 py-1.5 bg-slate-800 text-blue-100 rounded-md text-[10px] font-bold tracking-tight">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] border-b border-slate-700 pb-2 text-slate-500">Formation</h3>
        <div className="space-y-6">
          {cv.education.map((edu, i) => (
            <div key={i} className="space-y-1">
              <p className="font-bold text-xs text-white leading-tight">{edu.degree}</p>
              <p className="text-[10px] text-slate-400 font-medium">{edu.school}</p>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">{edu.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right Column (Main) */}
    <div className="flex-grow p-10 md:p-12 bg-white flex flex-col gap-10">
      <section>
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 whitespace-nowrap">Profil</h3>
          <div className="h-px bg-slate-100 w-full"></div>
        </div>
        <p className="text-[12px] text-slate-600 leading-relaxed font-normal text-justify">
          {cv.summary}
        </p>
      </section>

      <section className="flex-grow">
        <div className="flex items-center gap-4 mb-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 whitespace-nowrap">Expériences</h3>
          <div className="h-px bg-slate-100 w-full"></div>
        </div>
        <div className="space-y-8">
          {cv.experiences.map((exp, i) => {
            const isHidden = hiddenIndices.includes(i);
            return (
              <div 
                key={i} 
                className={`group relative transition-all duration-300 ${isHidden ? 'opacity-30 grayscale' : ''}`}
                data-html2canvas-ignore={isHidden ? "true" : undefined}
              >
                {onToggle && (
                  <div className="absolute -left-8 top-1 no-print z-20 print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="checkbox"
                      checked={!isHidden}
                      onChange={() => onToggle(i)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shadow-sm"
                      title={isHidden ? "Inclure cette expérience dans le CV" : "Exclure cette expérience du CV"}
                    />
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-1 mb-1">
                  <h4 className="font-black text-slate-900 text-[13px] uppercase tracking-tight">{exp.position}</h4>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{exp.period}</span>
                </div>
                <p className="text-[10px] font-bold text-blue-600 mb-3 bg-blue-50 inline-block px-2 py-0.5 rounded uppercase tracking-wider">{exp.company}</p>
                <ul className="space-y-2">
                  {exp.description.map((desc, j) => (
                    <li key={j} className="text-[11px] text-slate-600 leading-snug flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1 shrink-0"></span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        
        {/* Compact Experiences */}
        {cv.compactExperiences && cv.compactExperiences.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-100">
             <div className="flex items-center gap-4 mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 whitespace-nowrap">Autres expériences significatives</h3>
              <div className="h-px bg-slate-100 w-full"></div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {cv.compactExperiences.map((exp, i) => {
                const isHidden = hiddenCompactIndices.includes(i);
                return (
                  <div 
                    key={i} 
                    className={`group relative flex items-baseline justify-between border-b border-slate-50 pb-2 last:border-0 transition-all duration-300 ${isHidden ? 'opacity-30 grayscale' : ''}`}
                    data-html2canvas-ignore={isHidden ? "true" : undefined}
                  >
                    {onToggleCompact && (
                      <div className="absolute -left-8 top-1 no-print z-20 print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                        <input
                          type="checkbox"
                          checked={!isHidden}
                          onChange={() => onToggleCompact(i)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer shadow-sm"
                          title={isHidden ? "Inclure cette expérience dans le CV" : "Exclure cette expérience du CV"}
                        />
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                      <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-tight leading-tight">{exp.position}</h4>
                      <span className="hidden md:inline text-slate-300">•</span>
                      <span className="text-[10px] text-blue-600 font-bold">{exp.company}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 ml-4">{exp.period}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  </div>
);

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result, history, onSelectHistory, onReset, onNewJob, onRegenerate }) => {
  const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
  const [feedback, setFeedback] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hiddenExperienceIndices, setHiddenExperienceIndices] = useState<number[]>([]);

  useEffect(() => {
    // Reset hidden items when result changes (e.g. loaded from history)
    setHiddenExperienceIndices([]);
  }, [result]);

  const handleToggleExperience = (index: number) => {
    setHiddenExperienceIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const handleToggleCompactExperience = (index: number) => {
    // Note: Pour l'instant, on n'a pas besoin de stocker l'état "masqué" pour les expériences compactes
    // car elles sont déjà "secondaires". Mais on pourrait vouloir les supprimer complètement.
    // Ajoutons simplement la logique si besoin plus tard ou une simple suppression visuelle.
    // Ici, on va réutiliser le même tableau hiddenExperienceIndices mais avec un offset pour les distinguer ?
    // Non, utilisons un state séparé pour la clarté.
  };
  const [hiddenCompactIndices, setHiddenCompactIndices] = useState<number[]>([]);

  const toggleCompact = (index: number) => {
    setHiddenCompactIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
  
  // Reset quand le résultat change
  useEffect(() => {
    setHiddenCompactIndices([]);
  }, [result]);

  const handleUpdateHidden = () => {
    if (hiddenExperienceIndices.length === 0 && hiddenCompactIndices.length === 0) return;
    
    // Create a detailed prompt describing which experiences were removed
    const hiddenExperiences = hiddenExperienceIndices.map(index => {
      const exp = result.improvedCV.experiences[index];
      return `${exp.position} chez ${exp.company}`;
    });

    const hiddenCompact = hiddenCompactIndices.map(index => {
       const exp = result.improvedCV.compactExperiences?.[index];
       return exp ? `${exp.position} chez ${exp.company} (secondaire)` : '';
    }).filter(Boolean);

    const allHidden = [...hiddenExperiences, ...hiddenCompact].join(", ");

    const prompt = `J'ai masqué les expériences suivantes : ${allHidden}. 
    Peux-tu mettre à jour le CV (résumé, compétences, mise en page) pour qu'il soit cohérent sans ces expériences ? 
    Adapte aussi la lettre de motivation si nécessaire.`;
    
    onRegenerate(prompt);
  };

  const handleImproveScore = () => {
    const suggestionsText = result.suggestions.join('\n- ');
    const prompt = `Le score ATS actuel est de ${result.atsScore || 'inconnu'}%. 
    Pour l'améliorer, applique concrètement les corrections basées sur ces suggestions :
    - ${suggestionsText}
    
    Optimise le CV pour dépasser les 80% de matching.`;
    
    onRegenerate(prompt);
  };

  const handleAdjust = () => {
    if (!feedback.trim()) return;
    onRegenerate(feedback);
    setFeedback('');
  };

  const copyRichText = async (elementId: string) => {
    setIsCopying(true);
    const el = document.getElementById(elementId);
    if (!el) return;
    try {
      const type = "text/html";
      const blob = new Blob([el.innerHTML], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(data);
      alert("Formatage copié pour Word/Google Docs !");
    } catch (err) {
      navigator.clipboard.writeText(el.innerText);
      alert("Texte copié !");
    } finally {
      setIsCopying(false);
    }
  };

  const handlePrint = async () => {
    const elementId = activeTab === 'cv' ? 'cv-printable' : 'letter-printable';
    const content = document.getElementById(elementId);
    if (!content) return;

    try {
      // Apply compact mode for CV to fit on A4
      if (activeTab === 'cv') {
        content.classList.add('compact-mode');
      }

      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Use html2pdf for better rendering
      const opt = {
        margin: 0, // Zero margins
        filename: `${activeTab === 'cv' ? 'CV' : 'Lettre'}_${result.improvedCV.fullName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(content).save();
    } catch (err) {
      console.error("Erreur lors de la génération du PDF", err);
      alert("Impossible de générer le PDF. Veuillez réessayer.");
    } finally {
      // Remove compact mode
      if (activeTab === 'cv' && content) {
        content.classList.remove('compact-mode');
      }
    }
  };

  return (
    <div className="animate-slideUp max-w-6xl mx-auto mb-20 px-4">
      <style>{`
        /* Styles pour le mode compact (export PDF A4) */
        .compact-mode.print-container {
          min-height: auto !important;
          height: auto !important;
          overflow: visible !important;
        }
        .compact-mode .gap-10 { gap: 1.5rem !important; }
        .compact-mode .p-10 { padding: 1.5rem !important; }
        .compact-mode .md\\:p-12 { padding: 1.5rem !important; }
        .compact-mode .p-8 { padding: 1.5rem !important; }
        .compact-mode .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem !important; }
        .compact-mode .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem !important; }
        .compact-mode .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem !important; }
        .compact-mode .mb-8 { margin-bottom: 1rem !important; }
        .compact-mode .mb-4 { margin-bottom: 0.5rem !important; }
        .compact-mode h1 { font-size: 1.5rem !important; } /* Reduce title size */
        .compact-mode li { font-size: 9px !important; line-height: 1.2 !important; }
        .compact-mode p { font-size: 10px !important; }
        .compact-mode .text-\\[13px\\] { font-size: 11px !important; }
      `}</style>
      <div className="flex flex-wrap gap-4 mb-10 no-print items-center justify-between">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex">
          <button
            onClick={() => setActiveTab('cv')}
            className={`px-6 md:px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'cv' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <i className="fa-solid fa-address-card mr-2"></i>
            CV Design
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`px-6 md:px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'letter' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <i className="fa-solid fa-envelope-open-text mr-2"></i>
            Lettre & Motivations
          </button>
        </div>

        {history && history.length > 1 && (
          <div className="relative z-10">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              Historique
              <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-md">{history.length}</span>
            </button>
            
            {showHistory && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 max-h-80 overflow-y-auto">
                {history.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    onClick={() => {
                      onSelectHistory?.(item);
                      setShowHistory(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg text-xs hover:bg-slate-50 flex flex-col gap-1 ${result.id === item.id ? 'bg-blue-50 border border-blue-100' : ''}`}
                  >
                    <div className="font-bold text-slate-800">Version {history.length - idx}</div>
                    <div className="text-slate-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'Inconnue'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => copyRichText(activeTab === 'cv' ? 'cv-printable' : 'letter-printable')}
            disabled={isCopying}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <i className={`fa-solid ${isCopying ? 'fa-spinner animate-spin' : 'fa-copy'}`}></i>
            Copier Word
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-file-pdf"></i>
            Exporter PDF
          </button>

          <button
            onClick={onNewJob}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2 border border-blue-100"
            title="Garder le CV, changer d'offre"
          >
            <i className="fa-solid fa-rotate-left"></i>
            Autre offre
          </button>

          <button
            onClick={onReset}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all"
            title="Tout effacer"
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 flex flex-col items-center gap-10">
          <div className="overflow-x-auto w-full flex justify-center pb-4">
            {activeTab === 'cv' ? (
              <ResumeTemplate 
                cv={result.improvedCV} 
                hiddenIndices={hiddenExperienceIndices}
                hiddenCompactIndices={hiddenCompactIndices}
                onToggle={handleToggleExperience}
                onToggleCompact={toggleCompact}
              />
            ) : (
              <div id="letter-printable" className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 p-10 md:p-16 max-w-[800px] w-full min-h-[1050px] relative font-serif print-container">
                <div className="max-w-xl mx-auto">
                  <div className="text-right mb-16 text-sm text-slate-400 font-sans tracking-wide">
                    Fait à {result.improvedCV.contact.location || 'Paris'}, le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  
                  <div className="mb-12">
                    <p className="font-bold text-slate-900 mb-1 font-sans">{result.improvedCV.fullName}</p>
                    <p className="text-sm text-slate-500 font-sans">{result.improvedCV.contact.email}</p>
                    <p className="text-sm text-slate-500 font-sans">{result.improvedCV.contact.phone}</p>
                  </div>

                  <div className="prose prose-slate max-w-none">
                    <h2 className="text-xl font-black mb-10 text-slate-900 font-sans tracking-tight">Objet : Candidature au poste de {result.improvedCV.professionalTitle}</h2>
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-[15px]">
                      {result.coverLetter}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Module d'ajustement rapide */}
          <div className="w-full max-w-[800px] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm no-print">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles text-blue-600"></i>
              Ajuster le résultat avec l'IA
            </h4>
            
            {(hiddenExperienceIndices.length > 0 || hiddenCompactIndices.length > 0) && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-filter"></i>
                  </div>
                  <p className="text-xs text-amber-800 font-medium">
                    Vous avez masqué {hiddenExperienceIndices.length + hiddenCompactIndices.length} expérience(s). Voulez-vous regénérer le CV pour optimiser le reste du contenu ?
                  </p>
                </div>
                <button
                  onClick={handleUpdateHidden}
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap shadow-sm"
                >
                  Actualiser le CV
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ex: 'Mets plus en avant mes compétences en management' ou 'Rends la lettre plus concise'..."
                className="flex-grow p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20 shadow-inner"
              />
              <button
                onClick={handleAdjust}
                disabled={!feedback.trim()}
                className="px-6 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6 no-print">
          {/* Nouveau Bloc Motivations */}
          {activeTab === 'letter' && (
            <div className="bg-indigo-900 p-6 rounded-2xl shadow-xl shadow-indigo-100 text-white animate-fadeIn">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-sm">
                <i className="fa-solid fa-heart-pulse text-indigo-400"></i>
                Mes potentielles motivations
              </h3>
              <p className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-4">A utiliser en entretien</p>
              <ul className="space-y-4">
                {result.motivations.map((mot, i) => (
                  <li key={i} className="text-[11px] leading-relaxed flex gap-3 opacity-90 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-indigo-400 font-black">{i + 1}.</span>
                    {mot}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[9px] text-indigo-300 italic opacity-70">Ces points clés sont basés sur le matching entre votre parcours et les valeurs de l'offre.</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12"></div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 text-sm relative">
              <i className="fa-solid fa-bullseye text-blue-600"></i>
              Score ATS / Match
            </h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-[10px] font-black inline-block py-1 px-2 uppercase rounded bg-blue-100 text-blue-700">Pertinence</span></div>
                <div className="text-right"><span className="text-sm font-black text-blue-600">{result.atsScore || 85}%</span></div>
              </div>
              <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-slate-100">
                <div style={{ width: `${result.atsScore || 85}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"></div>
              </div>
            </div>

            {/* Low Score Warning */}
            {typeof result.atsScore === 'number' && result.atsScore < 80 && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl animate-fadeIn">
                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2 text-sm">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Potentiel d'amélioration
                </h4>
                <p className="text-xs text-orange-700 mb-3 leading-relaxed">
                  Score &lt; 80% détecté. Voici les points bloquants pour les ATS :
                </p>
                <ul className="mb-4 space-y-2">
                  {result.suggestions.slice(0, 3).map((sug, i) => (
                    <li key={i} className="text-[10px] text-orange-800 flex gap-2 items-start">
                      <span className="mt-1 w-1 h-1 rounded-full bg-orange-400 shrink-0"></span>
                      {sug}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleImproveScore}
                  className="w-full py-2 bg-orange-600 text-white text-[10px] font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-sm flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Optimiser pour viser 80%+
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 text-sm">
              <i className="fa-solid fa-tags text-indigo-600"></i>
              Mots-clés ciblés
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.keywordsFound.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] border border-slate-100 font-bold uppercase tracking-tight">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-emerald-900 p-6 rounded-2xl shadow-xl shadow-emerald-100 text-white">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-sm">
              <i className="fa-solid fa-wand-magic-sparkles text-emerald-400"></i>
              Conseils d'expert
            </h3>
            <ul className="space-y-4">
              {result.suggestions.map((sug, i) => (
                <li key={i} className="text-[11px] leading-relaxed flex gap-3 opacity-90">
                  <span className="text-emerald-400 font-black">•</span>
                  {sug}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
