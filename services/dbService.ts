import { supabase } from '../lib/supabaseClient';
import { AnalysisResult } from '../types';

export const saveApplication = async (result: AnalysisResult) => {
  // Mapping du résultat vers le schéma DB
  const { error } = await supabase
    .from('applications')
    .insert({
      id: result.id, // Si on veut garder le même UUID généré côté client, ou laisser Supabase le faire
      created_at: result.createdAt ? new Date(result.createdAt).toISOString() : new Date().toISOString(),
      original_cv_content: result.originalCVContent,
      job_description: result.originalJobDescription,
      ats_score: result.atsScore,
      improved_cv: result.improvedCV,
      cover_letter: result.coverLetter,
      motivations: result.motivations,
      keywords_found: result.keywordsFound,
      suggestions: result.suggestions,
      // On peut ajouter un titre basé sur l'entreprise ou le poste
      title: `${result.improvedCV.professionalTitle} - ${result.improvedCV.experiences[0]?.company || 'Nouvelle offre'}`
    });

  if (error) {
    console.error('Erreur lors de la sauvegarde Supabase:', error);
    throw error;
  }
};

export const fetchApplications = async (): Promise<AnalysisResult[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors du chargement Supabase:', error);
    throw error;
  }

  // Mapping inverse DB -> AnalysisResult
  return (data || []).map((row: any) => ({
    id: row.id,
    createdAt: new Date(row.created_at).getTime(),
    originalCVContent: row.original_cv_content,
    originalJobDescription: row.job_description,
    atsScore: row.ats_score,
    improvedCV: row.improved_cv,
    coverLetter: row.cover_letter,
    motivations: row.motivations,
    keywordsFound: row.keywords_found,
    suggestions: row.suggestions
  }));
};
