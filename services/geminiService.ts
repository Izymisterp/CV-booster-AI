
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileData, RefinementData } from "../types";

export const processApplication = async (
  cvContent: string,
  jobDescription: string,
  refinement?: RefinementData,
  cvFile?: FileData,
  feedback?: string // Nouveau paramètre pour la regénération
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });
  const model = "gemini-2.0-flash-exp";

  const isUrl = jobDescription.trim().startsWith('http');

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
    
    TACHE :
    1. Crée un CV optimisé (improvedCV). Améliore les descriptions pour qu'elles soient percutantes et utilisent des verbes d'action.
    2. Rédige une lettre de motivation (coverLetter) professionnelle et engageante.
    3. Génère une liste de 4 "motivations" (motivations) : ce sont des arguments de vente que le candidat pourra utiliser en entretien pour expliquer pourquoi il veut CE poste précisément chez CETTE entreprise.
    4. Identifie les mots-clés stratégiques (keywordsFound) et donne des conseils (suggestions).

    IMPORTANT: Respecte strictement le schéma JSON. Langue : Français.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{
        parts: [
          { text: prompt },
          ...(cvFile ? [{ inlineData: { data: cvFile.data, mimeType: cvFile.mimeType } }] : [])
        ]
      }],
      config: {
        tools: isUrl ? [{ googleSearch: {} }] : undefined,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
          required: ["improvedCV", "coverLetter", "motivations", "keywordsFound", "suggestions"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Erreur d'analyse. Vérifiez vos entrées ou réessayez.");
  }
};
