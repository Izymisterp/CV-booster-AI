
import React from 'react';

import { AnalysisResult } from '../types';

export type ModalType = 'guide' | 'ats' | 'models' | { type: 'details', data: AnalysisResult } | null;

interface InformationModalProps {
  type: ModalType;
  onClose: () => void;
}

const content = {
  guide: {
    title: "Guide de l'entretien réussi",
    icon: "fa-graduation-cap",
    color: "blue",
    sections: [
      {
        h: "La méthode STAR",
        p: "Répondez aux questions comportementales en décrivant la Situation, la Tâche, l'Action et le Résultat obtenu."
      },
      {
        h: "Recherche sur l'entreprise",
        p: "Ne vous contentez pas du site web. Regardez leurs dernières actualités sur LinkedIn et leurs rapports annuels."
      },
      {
        h: "Posez des questions",
        p: "Un candidat sans question est un candidat sans curiosité. Demandez : 'À quoi ressemble une journée type dans ce rôle ?'"
      }
    ]
  },
  ats: {
    title: "Comprendre les systèmes ATS",
    icon: "fa-robot",
    color: "indigo",
    sections: [
      {
        h: "Qu'est-ce qu'un ATS ?",
        p: "L'Applicant Tracking System est un logiciel qui scanne votre CV à la recherche de mots-clés spécifiques avant même qu'un humain ne le voie."
      },
      {
        h: "Pourquoi ce CV est optimisé ?",
        p: "Nous utilisons un format 'parse-friendly' qui garantit que l'IA de l'entreprise extrait correctement vos expériences."
      },
      {
        h: "Le score de match",
        p: "Un score de 80% ou plus est généralement nécessaire pour passer le premier filtre automatique."
      }
    ]
  },
  models: {
    title: "Nos Modèles de CV",
    icon: "fa-layer-group",
    color: "emerald",
    sections: [
      {
        h: "Design Premium Sidebar",
        p: "Le modèle actuel utilise une barre latérale sombre pour les informations statiques, laissant 70% de l'espace pour vos réalisations."
      },
      {
        h: "Hiérarchie Visuelle",
        p: "Nous utilisons des graisses de police variées (Inter Bold/Black) pour guider l'œil du recruteur vers vos titres de postes."
      },
      {
        h: "Compatibilité Impression",
        p: "Bien que moderne, le design reste sobre pour une impression noir et blanc parfaite sans perte de lisibilité."
      }
    ]
  }
};

export const InformationModal: React.FC<InformationModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  // Cas spécial pour les détails d'historique
  if (typeof type === 'object' && type.type === 'details') {
    const { data } = type;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-database text-xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-black">Détails de la candidature</h2>
                <p className="text-xs text-slate-400 opacity-80">Sauvegardé le {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Date inconnue'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-slate-50">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Colonne Gauche : Entrées */}
              <div className="space-y-6">
                <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs border-b border-slate-200 pb-2 mb-4">Données Originales</h3>
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-file-lines text-blue-600"></i>
                    CV Original
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {data.originalCVContent || "Contenu non disponible (fichier uploadé ?)"}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-briefcase text-blue-600"></i>
                    Annonce / Poste
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {data.originalJobDescription || "Non spécifié"}
                  </div>
                </div>
              </div>

              {/* Colonne Droite : Sorties */}
              <div className="space-y-6">
                <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs border-b border-slate-200 pb-2 mb-4">Résultats Générés</h3>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-600"></i>
                    CV Optimisé
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-bold text-slate-700">Titre :</span> {data.improvedCV.professionalTitle}</p>
                    <p className="text-sm"><span className="font-bold text-slate-700">Expériences :</span> {data.improvedCV.experiences.length}</p>
                    <p className="text-sm"><span className="font-bold text-slate-700">Compétences :</span> {data.improvedCV.skills.length}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-envelope-open-text text-indigo-600"></i>
                    Lettre de motivation
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 font-serif italic max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {data.coverLetter}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const data = content[type as 'guide' | 'ats' | 'models']; // Cast sûr car on a traité le cas object avant

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-scaleUp">
        <div className={`p-8 bg-${data.color}-600 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <i className={`fa-solid ${data.icon} text-2xl`}></i>
            </div>
            <h2 className="text-2xl font-black">{data.title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        <div className="p-8 space-y-8">
          {data.sections.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className={`w-8 h-8 rounded-full bg-${data.color}-50 text-${data.color}-600 flex items-center justify-center font-bold shrink-0`}>
                {i + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{s.h}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{s.p}</p>
              </div>
            </div>
          ))}
          <div className="pt-4">
            <button 
              onClick={onClose}
              className={`w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all`}
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
