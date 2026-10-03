/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SignDefinition } from '../types';
import { islDatasetAdapter, ISLClassRecord, ISLSignCategory } from '../services/datasetAdapter';

export function classRecordToSignDefinition(record: ISLClassRecord): SignDefinition {
  return {
    id: record.id,
    name: record.label,
    category: record.category,
    meaning: record.meaning,
    description: record.handPostureDescription,
    instructions: record.instructions,
    handPostureDescription: record.handPostureDescription,
    exampleSentence: record.exampleSentence,
    isDynamic: record.signType === 'dynamic',
    gestureType: record.signType === 'dynamic' ? 'Dynamic' : 'Static',
    signLanguage: 'Indian Sign Language (ISL)',
    relatedSigns: record.relatedSigns || [],
    motionType: record.motionType,
    difficulty: record.difficulty,
    handsRequired: record.handsRequired,
    isFingerspelling: record.isFingerspelling,
    isNumber: record.isNumber,
    datasetSource: record.datasetSource
  };
}

// Dynamically generated from ISLDatasetAdapter registry (Requirement 2 & 4)
export const SIGN_DEFINITIONS: SignDefinition[] = islDatasetAdapter
  .getRegisteredClasses()
  .map(classRecordToSignDefinition);

export const SIGN_DICTIONARY_MAP = new Map(SIGN_DEFINITIONS.map(s => [s.id, s]));

// Helper to look up by ID or Label
export function getSignDefinition(idOrLabel: string): SignDefinition | undefined {
  if (!idOrLabel) return undefined;
  const upper = idOrLabel.toUpperCase();
  if (SIGN_DICTIONARY_MAP.has(upper)) return SIGN_DICTIONARY_MAP.get(upper);
  return SIGN_DEFINITIONS.find(s => s.name.toUpperCase() === upper || s.id.toUpperCase() === upper);
}

// Categorized directory groups
export interface DirectoryCategory {
  category: ISLSignCategory;
  count: number;
  description: string;
  sampleSigns: string[];
}

export const SUPPORTED_SIGNS_DIRECTORY: DirectoryCategory[] = [
  {
    category: 'Greetings',
    count: islDatasetAdapter.getClassesByCategory('Greetings').length,
    description: 'Polite greetings, reverent salutations, and courtesies.',
    sampleSigns: ['HELLO', 'NAMASTE', 'GOOD MORNING', 'GOOD NIGHT', 'THANK YOU', 'WELCOME', 'PLEASE', 'SORRY']
  },
  {
    category: 'Daily Essentials',
    count: islDatasetAdapter.getClassesByCategory('Daily Essentials').length,
    description: 'Vital sustenance, daily beverages, shelter, and home needs.',
    sampleSigns: ['WATER', 'FOOD', 'TEA', 'HOME', 'YES', 'NO']
  },
  {
    category: 'Emergency & Health',
    count: islDatasetAdapter.getClassesByCategory('Emergency & Health').length,
    description: 'Urgent medical assistance, clinical aid, and doctor visits.',
    sampleSigns: ['HELP', 'DOCTOR', 'HOSPITAL']
  },
  {
    category: 'Questions & Pronouns',
    count: islDatasetAdapter.getClassesByCategory('Questions & Pronouns').length,
    description: 'Self-referral, direct address, and conversation pointers.',
    sampleSigns: ['I / ME', 'YOU']
  },
  {
    category: 'Relations & People',
    count: islDatasetAdapter.getClassesByCategory('Relations & People').length,
    description: 'Family units, friends, companions, and relations.',
    sampleSigns: ['FRIEND', 'FAMILY']
  },
  {
    category: 'Actions & Verbs',
    count: islDatasetAdapter.getClassesByCategory('Actions & Verbs').length,
    description: 'Key movement directives, beckoning, and cessation.',
    sampleSigns: ['COME', 'GO', 'STOP']
  },
  {
    category: 'Education & Work',
    count: islDatasetAdapter.getClassesByCategory('Education & Work').length,
    description: 'Academic tools, employment, and workplace tasks.',
    sampleSigns: ['BOOK', 'WORK']
  },
  {
    category: 'Feelings & States',
    count: islDatasetAdapter.getClassesByCategory('Feelings & States').length,
    description: 'Emotional states, quality ratings, and joy.',
    sampleSigns: ['GOOD', 'BAD', 'HAPPY']
  },
  {
    category: 'Numbers',
    count: islDatasetAdapter.getNumberClasses().length,
    description: 'Cardinal numerical digits (0 - 9).',
    sampleSigns: ['0 (ZERO)', '1 (ONE)', '2 (TWO)', '3 (THREE)', '4 (FOUR)', '5 (FIVE)']
  },
  {
    category: 'Fingerspelling',
    count: islDatasetAdapter.getFingerspellingClasses().length,
    description: 'ISL manual alphabet character poses for name and spelling recognition.',
    sampleSigns: ['LETTER A', 'LETTER B', 'LETTER C', 'LETTER D', 'LETTER E', 'LETTER L', 'LETTER V', 'LETTER Y']
  }
];

export const TOTAL_SUPPORTED_SIGNS = SIGN_DEFINITIONS.length;
