
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileData, RefinementData } from "../types";

const parseJsonFromModel = (raw: string): any => {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Réponse vide de l'IA.");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
  }

  const withoutFences = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFences);
  } catch {
  }

  const firstBrace = withoutFences.indexOf('{');
  const lastBrace = withoutFences.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = withoutFences.slice(firstBrace, lastBrace + 1);
    return JSON.parse(candidate);
  }

  throw new Error("Réponse IA non-JSON.");
};

const buildGeminiUserError = (error: any): string => {
  const message: string = String(error?.message ?? '');
  const causeMessage: string = String(error?.cause?.message ?? '');
  const combined = `${message}\n${causeMessage}`.trim();
  const status = error?.status ?? error?.code ?? error?.response?.status ?? error?.cause?.status ?? error?.cause?.code ?? error?.cause?.response?.status;

  if (typeof status === 'number') {
    if (status === 401) return "Clé API Gemini invalide ou manquante.";
    if (status === 403) return "Accès refusé par Gemini (clé restreinte / permissions / domaine non autorisé).";
    if (status === 429) return "Quota Gemini dépassé. Réessayez plus tard.";
    if (status === 404) return "Modèle Gemini indisponible. Essayez un autre modèle.";
  }

  if (/failed to fetch|networkerror|fetch failed|load failed/i.test(combined)) {
    return "Connexion réseau bloquée (CORS / proxy / adblock). Réessayez ou changez de réseau.";
  }
  if (/api key/i.test(combined) && /(invalid|missing|permission|unauthoriz|forbidden|denied)/i.test(combined)) {
    return "Clé API Gemini invalide ou manquante.";
  }
  if (/quota|rate|429/i.test(combined)) {
    return "Quota Gemini dépassé. Réessayez plus tard.";
  }
  if (/not found|404|model/i.test(combined)) {
    return "Modèle Gemini indisponible. Essayez un autre modèle.";
  }
  if (/referer|referrer|origin/i.test(combined) && /(block|denied|forbidden|unauthoriz)/i.test(combined)) {
    return "Accès refusé par Gemini (clé restreinte au domaine).";
  }

  return "Erreur d'analyse. Vérifiez vos entrées ou réessayez.";
};

export const processApplication = async (
  cvContent: string, 
  jobDescription: string, 
  refinement?: RefinementData,
  cvFile?: FileData,
  feedback?: string // Nouveau paramètre pour la regénération
): Promise<AnalysisResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error("Clé API Gemini manquante. Vérifiez votre fichier .env.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const preferredModel = (import.meta.env.VITE_GEMINI_MODEL || "").trim();
  const modelsToTry = [preferredModel, "gemini-2.0-flash", "gemini-1.5-flash"].filter(Boolean);

  const isUrl = jobDescription.trim().startsWith('http');
  const enableWebSearch = String(import.meta.env.VITE_GEMINI_ENABLE_WEB_SEARCH || '').toLowerCase() === 'true';

  const refinementPrompt = refinement ? `
    INFORMATIONS DE BASE :
    - Nom : ${refinement.fullName}, Titre : ${refinement.professionalTitle}
    - Contact : ${refinement.email}, ${refinement.phone}, ${refinement.location}
    - Expériences additionnelles : ${refinement.additionalExperience}
  ` : "";

  const feedbackPrompt = feedback ? `
    ATTENTION : L'utilisateur souhaite modifier le résultat précédent avec ce commentaire : "${feedback}". 
    Applique ces changements prioritairement tout en gardant la cohérence avec l'offre.
  ` : "";

  const prompt = `
    En tant qu'expert en recrutement (HR Tech), analyse les documents pour créer un dossier de candidature parfait.
    
    CONTEXTE DE L'OFFRE : ${isUrl ? "URL: " + jobDescription : jobDescription}
    
    ${cvContent ? `CONTENU DU CV :\n${cvContent}` : "Le CV est fourni via le fichier joint."}
    
    ${refinementPrompt}
    ${feedbackPrompt}
    
    OBJECTIF :
    Optimiser le CV pour maximiser le matching ATS tout en restant naturel et convaincant pour un recruteur humain.

    TACHES (ATS) :
    1) Identification des mots-clés essentiels (keywordsFound) :
       - Extrais les mots-clés les plus importants de l'offre (compétences techniques, soft skills, outils, certifications, qualifications, terminologie métier).
       - Mets en priorité ceux qui sont répétés ou fortement mis en avant.
       - Ne propose pas de mots-clés génériques sans lien avec l'offre.

    2) Adaptation du contenu et du langage (improvedCV) :
       - Reformule les expériences pour coller aux exigences de l'offre en utilisant les mots-clés identifiés de façon naturelle.
       - Pour chaque expérience pertinente : 3 à 6 puces max, verbes d'action, orienté résultats, quantifie quand possible (%, €, délais, volumes).
       - Adapte le résumé (summary) pour refléter directement le poste visé et reprendre les termes clés de l'offre.
       - Gère les acronymes : première occurrence en toutes lettres (ACRONYME), puis acronyme seul ensuite.
       - Si une info manque dans le CV, n'invente pas : reste plausible et générique (ex: "amélioration mesurable" -> "amélioration de performance").

    3) Optimisation du format (suggestions) :
       - Donne des recommandations concrètes “ATS-friendly” : éviter tableaux, colonnes multiples, pictogrammes, barres de niveaux, en-têtes/pieds de page lourds, polices exotiques.
       - Recommande une structure simple (une colonne) avec titres standards (Expérience, Formation, Compétences).
       - Recommande le format de fichier (PDF simple / DOCX) et les précautions.

    4) Lettre et motivations (coverLetter, motivations) :
       - Rédige une lettre professionnelle, humaine, authentique, sans jargon robotique.
       - Génère 4 motivations spécifiques à l'entreprise et au poste.

    5) Score ATS (atsScore) :
       - Donne un score sur 100 réaliste pour le CV produit vs l'offre.
       - Dans suggestions, liste les points faibles restants qui empêchent d'atteindre un score plus élevé.

    6) Expériences secondaires (compactExperiences) :
       - Identifie des expériences moins cruciales mais utiles, et place-les dans compactExperiences sans description détaillée (poste, entreprise, dates).

    IMPORTANT: Respecte strictement le schéma JSON. Langue : Français.
  `;

  try {
    const config = {
      tools: (isUrl && enableWebSearch) ? [{ googleSearch: {} }] : undefined,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          atsScore: { type: Type.INTEGER },
          improvedCV: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              professionalTitle: { type: Type.STRING },
              summary: { type: Type.STRING },
              contact: {
                type: Type.OBJECT,
                properties: {
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                },
                required: ["email", "phone", "location"]
              },
              experiences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    position: { type: Type.STRING },
                    period: { type: Type.STRING },
                    description: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["company", "position", "period", "description"]
                }
              },
              compactExperiences: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    position: { type: Type.STRING },
                    period: { type: Type.STRING },
                  },
                  required: ["company", "position", "period"]
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    school: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                  required: ["school", "degree", "year"]
                }
              },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["fullName", "professionalTitle", "summary", "contact", "experiences", "education", "skills"]
          },
          coverLetter: { type: Type.STRING },
          motivations: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywordsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["improvedCV", "coverLetter", "motivations", "keywordsFound", "suggestions", "atsScore"],
      },
    };

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ parts: [
            { text: prompt },
            ...(cvFile ? [{ inlineData: { data: cvFile.data, mimeType: cvFile.mimeType } }] : [])
          ]}],
          config,
        });

        return parseJsonFromModel(response.text || "") as AnalysisResult;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message ?? '');
        const status = err?.status ?? err?.code ?? err?.response?.status;
        const isModelMissing = (status === 404) || /not found|404|model/i.test(msg);
        if (!isModelMissing) break;
      }
    }

    throw lastError ?? new Error("Erreur d'analyse.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(buildGeminiUserError(error), { cause: error });
  }
};
