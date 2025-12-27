
import React, { useState } from 'react';
import { AnalysisResult, StructuredCV } from '../types';

interface ResultsSectionProps {
  result: AnalysisResult;
  onReset: () => void;
  onNewJob: () => void;
}

const ResumeTemplate: React.FC<{ cv: StructuredCV }> = ({ cv }) => (
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
          {cv.experiences.map((exp, i) => (
            <div key={i} className="group relative">
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
          ))}
        </div>
      </section>
      <footer className="mt-auto pt-6 border-t border-slate-50">
        <p className="text-[8px] text-slate-300 italic text-center uppercase tracking-[0.2em]">Document généré par CV Booster AI</p>
      </footer>
    </div>
  </div>
);

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result, onReset, onNewJob }) => {
  const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
  const [isCopying, setIsCopying] = useState(false);

  const copyRichText = async (elementId: string) => {
    setIsCopying(true);
    const el = document.getElementById(elementId);
    if (!el) return;

    try {
      const type = "text/html";
      const blob = new Blob([el.innerHTML], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      await navigator.clipboard.write(data);
      alert("Formatage copié ! Vous pouvez maintenant coller directement dans Word ou Google Docs.");
    } catch (err) {
      // Fallback au texte brut si ClipboardItem n'est pas supporté
      navigator.clipboard.writeText(el.innerText);
      alert("Texte copié ! (Formatage simplifié)");
    } finally {
      setIsCopying(false);
    }
  };

  const handlePrint = () => {
    const elementId = activeTab === 'cv' ? 'cv-printable' : 'letter-printable';
    const content = document.getElementById(elementId);
    if (!content) return;

    // Création d'une fenêtre popup pour l'impression (plus fiable dans les iframes)
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert("Le bloqueur de fenêtres surgissantes empêche l'impression. Veuillez l'autoriser ou utiliser le bouton de copie.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Impression - ${result.improvedCV.fullName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: white; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print-container { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="flex justify-center p-0">
            ${content.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                // window.close(); // Optionnel : fermer après impression
              }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="animate-slideUp max-w-6xl mx-auto mb-20 px-4">
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
            Lettre
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => copyRichText(activeTab === 'cv' ? 'cv-printable' : 'letter-printable')}
            disabled={isCopying}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <i className={`fa-solid ${isCopying ? 'fa-spinner animate-spin' : 'fa-copy'}`}></i>
            Copier pour Word
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-file-pdf"></i>
            Exporter / Imprimer
          </button>

          <button
            onClick={onNewJob}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2 border border-blue-100"
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
        <div className="lg:col-span-3 flex justify-center overflow-x-auto pb-8">
          {activeTab === 'cv' ? (
            <ResumeTemplate cv={result.improvedCV} />
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

        <div className="lg:col-span-1 space-y-6 no-print">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12"></div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 text-sm relative">
              <i className="fa-solid fa-bullseye text-blue-600"></i>
              Score de Match
            </h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-[10px] font-black inline-block py-1 px-2 uppercase rounded bg-blue-100 text-blue-700">Pertinence</span></div>
                <div className="text-right"><span className="text-sm font-black text-blue-600">95%</span></div>
              </div>
              <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-slate-100">
                <div style={{ width: "95%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"></div>
              </div>
            </div>
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
