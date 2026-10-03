/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SceneDetection } from '../types';

export const COMMON_SCENE_OBJECTS: SceneDetection[] = [
  {
    id: 'scene-bus-1',
    objectName: 'Public Transit Bus #42',
    confidence: 0.94,
    category: 'transit',
    icon: '🚌',
    suggestedSignPrompt: 'WHERE BUS'
  },
  {
    id: 'scene-hospital-1',
    objectName: 'Hospital Emergency Entrance',
    confidence: 0.98,
    category: 'medical',
    icon: '🏥',
    suggestedSignPrompt: 'HELP DOCTOR'
  },
  {
    id: 'scene-water-1',
    objectName: 'Drinking Water Dispenser',
    confidence: 0.91,
    category: 'facility',
    icon: '🚰',
    suggestedSignPrompt: 'WATER PLEASE'
  },
  {
    id: 'scene-door-1',
    objectName: 'Accessible Restroom Entrance',
    confidence: 0.95,
    category: 'facility',
    icon: '🚻',
    suggestedSignPrompt: 'WHERE RESTROOM'
  },
  {
    id: 'scene-train-1',
    objectName: 'Metro Rail Ticket Counter',
    confidence: 0.89,
    category: 'transit',
    icon: '🚆',
    suggestedSignPrompt: 'WHERE TICKET'
  },
  {
    id: 'scene-person-1',
    objectName: 'Customer Service Representative',
    confidence: 0.93,
    category: 'person',
    icon: '👤',
    suggestedSignPrompt: 'CAN YOU HELP'
  }
];

export function enrichSentenceWithSceneContext(
  rawSentence: string,
  detectedScene: SceneDetection | null
): { enrichedSentence: string; isEnriched: boolean; contextExplanation: string } {
  if (!detectedScene) {
    return {
      enrichedSentence: rawSentence,
      isEnriched: false,
      contextExplanation: ''
    };
  }

  const lower = rawSentence.toLowerCase();

  if (lower.includes('water') && detectedScene.category === 'facility' && detectedScene.objectName.includes('Water')) {
    return {
      enrichedSentence: 'I need water from the dispenser nearby, please.',
      isEnriched: true,
      contextExplanation: `Scene AI observed ${detectedScene.objectName} (91% confidence).`
    };
  }

  if (lower.includes('help') && detectedScene.category === 'medical') {
    return {
      enrichedSentence: 'I need emergency medical assistance at the hospital entrance.',
      isEnriched: true,
      contextExplanation: `Scene AI observed ${detectedScene.objectName} (98% confidence).`
    };
  }

  if (lower.includes('where') && detectedScene.category === 'transit') {
    return {
      enrichedSentence: `Where is the boarding platform for ${detectedScene.objectName}?`,
      isEnriched: true,
      contextExplanation: `Scene AI observed ${detectedScene.objectName} (94% confidence).`
    };
  }

  return {
    enrichedSentence: rawSentence,
    isEnriched: false,
    contextExplanation: ''
  };
}
