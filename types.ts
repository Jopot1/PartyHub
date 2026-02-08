export enum View {
  HUB = 'HUB',
  UNDERCOVER = 'UNDERCOVER',
  WEREWOLF = 'WEREWOLF',
  RULES = 'RULES',
  PSYCHIATRIST = 'PSYCHIATRIST',
  TWENTY_ONE = 'TWENTY_ONE',
  PASSWORD = 'PASSWORD',
  PALMIER = 'PALMIER',
  DEALER = 'DEALER'
}

export interface Player {
  id: string;
  name: string;
}

export interface UndercoverWordPair {
  civilian: string;
  undercover: string;
}

export enum WerewolfRole {
  VILLAGER = 'Villageois',
  WEREWOLF = 'Loup-Garou',
  WHITE_WEREWOLF = 'Loup Blanc',
  SEER = 'Voyante',
  WITCH = 'Sorcière',
  HUNTER = 'Chasseur',
  GUARDIAN = 'Gardien',
  LITTLE_GIRL = 'Petite Fille',
  CUPID = 'Cupidon',
  VILLAGE_IDIOT = 'Idiot du Village'
}

export interface CardRuleSection {
  title: string;
  content: string;
}

export interface CardRule {
  id: string;
  title: string;
  sections: CardRuleSection[];
  targetView?: View;
  isDrinking?: boolean;
}

export type PsychiatristCategory = 'BEHAVIOR' | 'IDENTITY' | 'VERBAL';

export interface PsychiatristRule {
  id: string;
  name: string;
  description: string;
  category: PsychiatristCategory;
  hint: string;
}

// Fix: Added missing PsychiatristSubject and PsychiatristSubjectList interfaces to resolve import error in psychiatristList.ts
export interface PsychiatristSubject {
  name: string;
  hint: string;
}

export interface PsychiatristSubjectList {
  id: string;
  label: string;
  data: PsychiatristSubject[];
}

export interface PalmierRule {
  cardValue: string;
  rule: string;
}