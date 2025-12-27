
import React from 'react';
import { RefinementData } from '../types';

interface RefinementSectionProps {
  data: RefinementData;
  setData: (data: RefinementData) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const RefinementSection: React.FC<RefinementSectionProps> = ({ data, setData, onConfirm, onBack }) => {
  const handleChange = (field: keyof RefinementData, value: any) => {
    setData({ ...data, [field]: value });
  };

  const handleLinkChange = (field: keyof RefinementData['links'], value: string) => {
    setData({
      ...data,
      links: { ...data.links, [field]: value }
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-slideUp">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-slate-900">Personnalisez votre dossier</h3>
        <p className="text-slate-500">Ajustez vos coordonnées et ajoutez des détails pour un CV sur-mesure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
            <i className="fa-solid fa-address-card text-blue-600"></i>
            Coordonnées & Titre
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Nom Complet</label>
              <input 
                type="text" 
                value={data.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Titre du Profil</label>
              <input 
                type="text" 
                value={data.professionalTitle}
                onChange={(e) => handleChange('professionalTitle', e.target.value)}
                placeholder="Ex: Chef de Projet Digital"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Email</label>
                <input 
                  type="email" 
                  value={data.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Téléphone</label>
                <input 
                  type="text" 
                  value={data.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Ville / Localisation</label>
              <input 
                type="text" 
                value={data.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ex: Paris, France"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Web Links Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
            <i className="fa-solid fa-link text-indigo-600"></i>
            Liens Professionnels
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <i className="fa-brands fa-linkedin text-xl text-slate-400 w-6"></i>
              <input 
                type="text" 
                placeholder="Lien LinkedIn"
                value={data.links.linkedin}
                onChange={(e) => handleLinkChange('linkedin', e.target.value)}
                className="flex-grow p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-globe text-xl text-slate-400 w-6"></i>
              <input 
                type="text" 
                placeholder="Portfolio / Site web"
                value={data.links.portfolio}
                onChange={(e) => handleLinkChange('portfolio', e.target.value)}
                className="flex-grow p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-brands fa-github text-xl text-slate-400 w-6"></i>
              <input 
                type="text" 
                placeholder="Lien GitHub"
                value={data.links.github}
                onChange={(e) => handleLinkChange('github', e.target.value)}
                className="flex-grow p-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
            <i className="fa-solid fa-plus-circle text-emerald-600"></i>
            Expériences ou compétences additionnelles
          </h4>
          <p className="text-xs text-slate-500 italic">Mentionnez ici tout ce qui n'est pas dans votre CV actuel mais que vous aimeriez ajouter (ex: une mission récente, une certification spécifique, un projet perso).</p>
          <textarea 
            value={data.additionalExperience}
            onChange={(e) => handleChange('additionalExperience', e.target.value)}
            placeholder="Détaillez ici vos ajouts..."
            className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-10">
        <button 
          onClick={onBack}
          className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Retour
        </button>
        <button 
          onClick={onConfirm}
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full font-bold shadow-xl shadow-blue-200 hover:scale-105 transition-transform active:scale-95 flex items-center gap-3"
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i>
          Générer mon dossier final
        </button>
      </div>
    </div>
  );
};
