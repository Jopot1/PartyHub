import { PsychiatristRule } from '../types';

export const PSYCHIATRIST_RULES: PsychiatristRule[] = [
  // IDENTITÉ (Identity)
  {
    id: 'right_neighbor',
    name: "Le Voisin de Droite",
    description: "Vous n'êtes pas vous-même. Vous répondez aux questions comme si vous étiez la personne assise à votre DROITE (son métier, sa vie, ses goûts).",
    category: 'IDENTITY',
    hint: "On note une incohérence topographique systématique : l'identité assumée par le sujet N correspond aux données biographiques du sujet N+1."
  },
  {
    id: 'left_neighbor',
    name: "Le Voisin de Gauche",
    description: "Vous n'êtes pas vous-même. Vous répondez aux questions comme si vous étiez la personne assise à votre GAUCHE.",
    category: 'IDENTITY',
    hint: "Une dissociation identitaire se propage latéralement : chaque patient semble capturer et projeter l'ego de l'individu situé à sa proximité immédiate."
  },
  {
    id: 'opposite_gender',
    name: "Inversion de Genre",
    description: "Les hommes sont des femmes, les femmes sont des hommes. Inventez-vous une vie crédible du sexe opposé.",
    category: 'IDENTITY',
    hint: "Les patients présentent une dysmorphie cognitive sévère : le genre social revendiqué est en opposition binaire stricte avec leurs caractéristiques phénotypiques."
  },
  
  // VERBAL (Logique stricte)
  {
    id: 'no_e',
    name: "Lipogramme en E",
    description: "Il est interdit de prononcer la lettre 'E'. Si un mot contient un 'E', trouvez un synonyme.",
    category: 'VERBAL',
    hint: "Analyse spectrale : Effondrement statistique d'une fréquence phonémique majeure (la plus courante de la langue), entraînant des périphrases compensatoires complexes."
  },
  {
    id: 'word_limit',
    name: "Laconique",
    description: "Vos phrases doivent faire STRICTEMENT moins de 5 mots. Soyez bref.",
    category: 'VERBAL',
    hint: "Les sujets souffrent d'une restriction quantitative sévère du débit verbal, imposant une syntaxe tronquée type 'télégramme'."
  },
  {
    id: 'last_letter_start',
    name: "Marabout",
    description: "Votre phrase doit commencer par la même lettre (ou le même son) qui termine la question du Psychiatre.",
    category: 'VERBAL',
    hint: "Le déclenchement de la parole du patient ne semble pas autonome, mais conditionné par la rémanence phonétique finale de votre propre discours."
  },
  {
    id: 'doctor_end',
    name: "Politesse Excessive",
    description: "Vous devez obligatoirement terminer toutes vos phrases par le mot 'Docteur'.",
    category: 'VERBAL',
    hint: "Le groupe manifeste un besoin compulsif et rituel de réaffirmer votre statut hiérarchique à la clôture de chaque intervention."
  },
  {
    id: 'no_yes_no',
    name: "Ni Oui Ni Non",
    description: "Il est interdit de dire 'Oui', 'Non', 'Ouais', 'Nan'. Trouvez des détours.",
    category: 'VERBAL',
    hint: "Incapacité pathologique à formuler une validation ou une réfutation binaire. Les patients semblent contraints à l'évitement circonvolutionnaire."
  },
  {
    id: 'repeat_last',
    name: "Écho",
    description: "Vous devez commencer votre réponse en répétant le dernier mot de la question du psychiatre.",
    category: 'VERBAL',
    hint: "Un phénomène de réverbération auditive immédiate parasite l'entame de chaque réponse, forçant une répétition involontaire."
  },

  // COMPORTEMENTAL (Mécanique physique)
  {
    id: 'touch_nose',
    name: "Le Nez Sensible",
    description: "Avant de répondre, vous devez discrètement toucher votre nez ou votre visage avec votre main.",
    category: 'BEHAVIOR',
    hint: "Un geste parasite stéréotypé visant la zone faciale précède systématiquement l'activation des cordes vocales."
  },
  {
    id: 'look_ceiling',
    name: "Inspiration Divine",
    description: "Vous devez regarder en l'air (le plafond ou le ciel) pendant que vous réfléchissez à votre réponse.",
    category: 'BEHAVIOR',
    hint: "Une rupture du contact visuel vers l'axe vertical supérieur semble neurologiquement nécessaire pour accéder à la mémoire sémantique."
  },
  {
    id: 'cross_legs',
    name: "Jambes Croisées",
    description: "Si vous mentez, décroisez les jambes. Si vous dites la vérité, croisez les jambes. Changez de position discrètement.",
    category: 'BEHAVIOR',
    hint: "La configuration posturale des membres inférieurs agit comme un indicateur binaire (0/1) corrélé à la fiabilité des propos tenus."
  },
  {
    id: 'fake_smile',
    name: "Sourire Forcé",
    description: "Vous devez arborer un grand sourire forcé tout le temps que vous parlez. Dès que vous vous taisez, redevenez neutre.",
    category: 'BEHAVIOR',
    hint: "Une dissonance émotionnelle faciale (rictus d'euphorie) apparaît exclusivement durant la phase de phonation et s'effondre au silence."
  },
  {
    id: 'cough_start',
    name: "Gorge Irritée",
    description: "Vous devez vous racler la gorge ou tousser légèrement avant chaque réponse.",
    category: 'BEHAVIOR',
    hint: "Le canal vocal nécessite une purgation mécanique audible (toux réflexe) avant toute tentative d'émission sonore."
  },
  {
    id: 'liar_paradox',
    name: "Menteur Pathologique",
    description: "Si la question est fermée (Oui/Non), vous MENTEZ. Si la question est ouverte, vous dites la VÉRITÉ.",
    category: 'BEHAVIOR',
    hint: "La véracité clinique du discours fluctue radicalement selon la structure grammaticale (ouverte vs fermée) de l'interrogation posée."
  }
];