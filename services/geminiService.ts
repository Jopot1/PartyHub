import { GoogleGenAI, Type } from "@google/genai";
import { UndercoverWordPair } from "../types";

// Fallback data in case API is not available or fails
const FALLBACK_PAIRS: UndercoverWordPair[] = [
  { civilian: "Chien", undercover: "Loup" },
  { civilian: "Café", undercover: "Thé" },
  { civilian: "Facebook", undercover: "Twitter" },
  { civilian: "Piano", undercover: "Guitare" },
  { civilian: "Plage", undercover: "Piscine" },
  { civilian: "Paris", undercover: "Londres" },
];

const BANNED_WORDS = [
  "Chien", "Loup", "Chat", "Tigre", "Lion", "Ours",
  "Café", "Thé", "Bière", "Vin", "Champagne", "Eau", "Soda", "Jus", "Coca", "Whisky", "Vodka",
  "Facebook", "Twitter", "Instagram", "Tiktok", "Snapchat", "Linkedin",
  "Piano", "Guitare", "Violon", "Trompette", "Batterie",
  "Plage", "Piscine", "Montagne", "Mer", "Océan", "Lac", "Rivière",
  "Paris", "Londres", "New York", "Madrid", "Rome", "Tokyo",
  "Banane", "Pomme", "Fraise", "Orange", "Citron", "Poire",
  "Foot", "Rugby", "Tennis", "Basket", "Handball",
  "Voiture", "Camion", "Moto", "Vélo",
  "Stylo", "Crayon", "Feutre",
  "Chaise", "Fauteuil", "Canapé", "Table"
];

const SUB_THEMES = [
  "Un objet technique ou mécanique",
  "Un élément naturel spécifique",
  "Un concept abstrait",
  "Un objet de la cuisine",
  "Un vêtement ou accessoire",
  "Un métier",
  "Un lieu historique",
  "Une émotion",
  "Un outil de bricolage",
  "Un instrument scientifique"
];

export const generateUndercoverWords = async (category: string): Promise<UndercoverWordPair> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const randomSubTheme = SUB_THEMES[Math.floor(Math.random() * SUB_THEMES.length)];
  
  let promptContext = "";
  if (category === "Adultes (18+)") {
    promptContext = `
      THÈME OBLIGATOIRE : Sexe, Spicy, Hot, Coquin, Érotisme, Anatomie intime.
      Tu DOIS générer des mots qui font référence explicitement à la sexualité, aux fantasmes, au corps nu ou à l'intimité.
      INTERDICTIONS STRICTES : ABSOLUMENT AUCUN ALCOOL, pas de drogues.
    `;
  } else {
    promptContext = `
      Catégorie du jeu : ${category}.
      POUR VARIER, APPLIQUE CE SOUS-CONTEXTE : "${randomSubTheme}".
      Sois créatif, surprenant et difficile.
    `;
  }

  const prompt = `
    Agis comme un générateur de mots pour le jeu 'Undercover'.
    LANGUE DE SORTIE : FRANÇAIS UNIQUEMENT.
    Tâche: Génère UNE paire de mots (Civilian vs Undercover).
    Règles :
    1. Les mots doivent être sémantiquement proches mais distincts.
    2. ${promptContext}
    3. LISTE NOIRE (Interdits): ${BANNED_WORDS.join(", ")}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            civilian: { type: Type.STRING, description: "Le mot pour les civils" },
            undercover: { type: Type.STRING, description: "Le mot pour l'undercover" }
          },
          required: ["civilian", "undercover"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as UndercoverWordPair;
    }
    throw new Error("Empty AI response");
  } catch (error) {
    console.warn("Fallback to static pairs due to error:", error);
    return FALLBACK_PAIRS[Math.floor(Math.random() * FALLBACK_PAIRS.length)];
  }
};

export const generatePasswordWords = async (category: string, count: number): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `
      Agis comme un générateur "Mot de Passe". 
      LANGUE DE SORTIE : FRANÇAIS UNIQUEMENT.
      CATÉGORIE : ${category}. 
      QUANTITÉ : ${count} mots.
      Fournis une liste de mots variés, devinables mais intéressants.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as string[];
    }
    return ["Erreur", "Réessaie"];
  } catch (error) {
    console.error("Gemini Password Error:", error);
    return ["Mode", "Hors-ligne", "Erreur API"];
  }
};