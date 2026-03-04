export enum View {
  HUB = 'HUB',
  UNDERCOVER = 'UNDERCOVER',
  WEREWOLF = 'WEREWOLF',
  RULES = 'RULES',
  PSYCHIATRIST = 'PSYCHIATRIST',
  TWENTY_ONE = 'TWENTY_ONE',
  PASSWORD = 'PASSWORD'
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
  SEER = 'Voyante',
  WITCH = 'Sorcière',
  HUNTER = 'Chasseur',
  CUPID = 'Cupidon'
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