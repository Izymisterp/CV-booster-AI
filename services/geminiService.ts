
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileData, RefinementData } from "../types";

export const processApplication = async (
  cvContent: string, 
  jobDescription: string, 
  refinement?: RefinementData,
  cvFile?: FileData
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  const model = "gemini-3-flash-preview";

  const isUrl = jobDescription.trim().startsWith('http');

  const refinementPrompt = refinement ? `
    UTILISE PRIORITAIREMENT CES INFORMATIONS DE RAFFINEMENT :
    - Nom Complet : ${refinement.fullName}
    - Titre visé : ${refinement.professionalTitle}
    - Email : ${refinement.email}
    - Téléphone : ${refinement.phone}
    - Ville/Région : ${refinement.location}
    - Liens : LinkedIn (${refinement.links.linkedin}), Portfolio (${refinement.links.portfolio}), GitHub (${refinement.links.github})
    - Expériences/Détails additionnels à intégrer : ${refinement.additionalExperience}
  ` : "";

  const jobContext = isUrl 
    ? `L'offre d'emploi se trouve à cette URL : ${jobDescription}. Analyse le contenu de cette page pour extraire les prérequis, les missions et les compétences.`
    : `Voici la description de l'offre : ${jobDescription}`;

  const prompt = `
    En tant qu'expert en recrutement (HR Tech), analyse les documents fournis pour créer un dossier de candidature parfait.
    
    ${jobContext}
    
    ${cvContent ? `CONTENU DU CV TEXTUEL :\n${cvContent}` : "Le CV est fourni sous forme de fichier joint."}
    
    ${refinementPrompt}
    
    TACHE :
    1. Analyse le CV original et l'offre d'emploi (via le texte ou l'URL fournie).
    2. Crée un CV optimisé et structuré pour l'offre. Améliore les titres, les descriptions et mets en avant les mots-clés de l'offre.
    3. Rédige une lettre de motivation personnalisée intégrant les éléments de l'offre et les points forts du candidat.
    4. Identifie les mots-clés stratégiques et donne 3 conseils d'entretien spécifiques à ce poste.

    IMPORTANT: Respecte strictement le schéma JSON. Utilise les informations de contact du raffinement en priorité.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [
        { text: prompt },
        ...(cvFile ? [{ inlineData: { data: cvFile.data, mimeType: cvFile.mimeType } }] : [])
      ]}],
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
                    portfolio: { type: Type.STRING },
                    github: { type: Type.STRING },
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
            keywordsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["improvedCV", "coverLetter", "keywordsFound", "suggestions"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Erreur d'analyse. Si vous avez utilisé une URL, vérifiez qu'elle est accessible publiquement.");
  }
};
