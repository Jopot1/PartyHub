import { UndercoverWordPair } from "../types";

// --- CONFIGURATION ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// On utilise le modèle validé par ton test (gemini-2.5-flash)
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// --- DONNÉES STATIQUES (FALLBACK & RÈGLES) ---

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

// --- MOTEUR API (Architecture sans SDK) ---

const callGeminiRaw = async (prompt: string) => {
    if (!API_KEY) {
        console.error("ERREUR CRITIQUE : Clé API manquante dans .env.local");
        throw new Error("Clé API manquante");
    }

    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                // Force le modèle à renvoyer du JSON structurellement valide
                response_mime_type: "application/json",
                temperature: 1.0 
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("ERREUR API GEMINI:", errorData);
        throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    // Extraction sécurisée du texte
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) throw new Error("Réponse vide de l'IA");

    // Nettoyage des balises Markdown (```json ... ```) souvent ajoutées par l'IA
    return rawText.replace(/```json|```/g, '').trim();
};

// --- FONCTIONS MÉTIER EXPORTÉES ---

export const generateUndercoverWords = async (category: string): Promise<UndercoverWordPair> => {
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
      Format JSON attendu : { "civilian": "string", "undercover": "string" }
    `;

    try {
        const jsonString = await callGeminiRaw(prompt);
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn("Passage en mode hors-ligne (Fallback) suite à une erreur:", error);
        return FALLBACK_PAIRS[Math.floor(Math.random() * FALLBACK_PAIRS.length)];
    }
};

export const generatePasswordWords = async (category: string, count: number): Promise<string[]> => {
    try {
        const prompt = `
            Agis comme un générateur "Mot de Passe". FRANÇAIS UNIQUEMENT.
            CATÉGORIE : ${category}. QUANTITÉ : ${count} mots.
            Format JSON attendu : ["mot1", "mot2", ...]
        `;

        const jsonString = await callGeminiRaw(prompt);
        return JSON.parse(jsonString) as string[];
    } catch (error) {
        console.error("Gemini Password Error", error);
        return ["Erreur IA", "Mode hors-ligne"];
    }
};