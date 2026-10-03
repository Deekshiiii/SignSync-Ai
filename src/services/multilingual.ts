/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SupportedLanguage, LanguageMeta } from '../types';

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

// Rich multilingual translation map for common sign sentences and conversational turns
const TRANSLATION_MAP: Record<string, Record<SupportedLanguage, string>> = {
  // Common sentences
  'I need help.': {
    en: 'I need help.',
    ta: 'எனக்கு உதவி தேவை.',
    hi: 'मुझे मदद चाहिए।',
    te: 'నాకు సహాయం కావాలి.',
    ml: 'എനിക്ക് സഹായം വേണം.',
    kn: 'ನನಗೆ ಸಹಾಯ ಬೇಕು.'
  },
  'I want water.': {
    en: 'I want water.',
    ta: 'எனக்கு தண்ணீர் வேண்டும்.',
    hi: 'मुझे पानी चाहिए।',
    te: 'నాకు నీళ్లు కావాలి.',
    ml: 'എനിക്ക് വെള്ളം വേണം.',
    kn: 'ನನಗೆ ನೀರು ಬೇಕು.'
  },
  'Can you help me?': {
    en: 'Can you help me?',
    ta: 'எனக்கு உதவ முடியுமா?',
    hi: 'क्या आप मेरी मदद कर सकते हैं?',
    te: 'మీరు నాకు సహాయం చేయగలరా?',
    ml: 'നിങ്ങൾക്ക് എന്നെ സഹായിക്കാമോ?',
    kn: 'ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?'
  },
  'Hello!': {
    en: 'Hello!',
    ta: 'வணக்கம்!',
    hi: 'नमस्ते!',
    te: 'నమస్కారం!',
    ml: 'നമസ്കാരം!',
    kn: 'ನಮಸ್ಕಾರ!'
  },
  'Hello, my name is Deekshitha.': {
    en: 'Hello, my name is Deekshitha.',
    ta: 'வணக்கம், என் பெயர் தீக்ஷிதா.',
    hi: 'नमस्ते, मेरा नाम दीक्षिता है।',
    te: 'నమస్కారం, నా పేరు దీక్షిత.',
    ml: 'നമസ്കാരം, എന്റെ പേര് ദീക്ഷിത.',
    kn: 'ನಮಸ್ಕಾರ, ನನ್ನ ಹೆಸರು ದೀಕ್ಷಿತಾ.'
  },
  'Thank you very much.': {
    en: 'Thank you very much.',
    ta: 'மிக்க நன்றி.',
    hi: 'बहुत बहुत धन्यवाद।',
    te: 'చాలా ధన్యవాదాలు.',
    ml: 'വളരെ നന്ദി.',
    kn: 'ತುಂಬಾ ಧನ್ಯವಾದಗಳು.'
  },
  'Please help me.': {
    en: 'Please help me.',
    ta: 'தயவுசெய்து எனக்கு உதவுங்கள்.',
    hi: 'कृपया मेरी मदद करें।',
    te: 'దయచేసి నాకు సహాయం చేయండి.',
    ml: 'ദയവായി എന്നെ സഹായിക്കൂ.',
    kn: 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ.'
  },
  'I am sorry.': {
    en: 'I am sorry.',
    ta: 'என்னை மன்னிக்கவும்.',
    hi: 'मुझे खेद है।',
    te: 'నన్ను క్షమించండి.',
    ml: 'എന്നോട് ക്ഷമിക്കണം.',
    kn: 'ನನ್ನನ್ನು ಕ್ಷಮಿಸಿ.'
  },
  'I want food.': {
    en: 'I want food.',
    ta: 'எனக்கு உணவு வேண்டும்.',
    hi: 'मुझे खाना चाहिए।',
    te: 'నాకు ఆహారం కావాలి.',
    ml: 'എനിക്ക് ഭക്ഷണം വേണം.',
    kn: 'ನನಗೆ ಊಟ ಬೇಕು.'
  },
  'Yes.': {
    en: 'Yes.',
    ta: 'ஆம்.',
    hi: 'हाँ।',
    te: 'అవును.',
    ml: 'അതെ.',
    kn: 'ಹೌದು.'
  },
  'No, thank you.': {
    en: 'No, thank you.',
    ta: 'இல்லை, நன்றி.',
    hi: 'नहीं, धन्यवाद।',
    te: 'లేదు, ధన్యవాదాలు.',
    ml: 'ഇല്ല, നന്ദി.',
    kn: 'ಇಲ್ಲ, ಧನ್ಯವಾದಗಳು.'
  },
  'Please stop.': {
    en: 'Please stop.',
    ta: 'தயவுசெய்து நிறுத்துங்கள்.',
    hi: 'कृपया रुकें।',
    te: 'దయచేసి ఆపండి.',
    ml: 'ദയവായി നിർത്തുക.',
    kn: 'ದಯವಿಟ್ಟು ನಿಲ್ಲಿಸಿ.'
  },
  'I need immediate assistance.': {
    en: 'I need immediate assistance.',
    ta: 'எனக்கு உடனடி உதவி தேவை.',
    hi: 'मुझे तत्काल सहायता की आवश्यकता है।',
    te: 'నాకు తక్షణ సహాయం కావాలి.',
    ml: 'എനിക്ക് അടിയന്തര സഹായം വേണം.',
    kn: 'ನನಗೆ ತಕ್ಷಣದ ಸಹಾಯ ಬೇಕು.'
  },
  'Where is the hospital?': {
    en: 'Where is the hospital?',
    ta: 'மருத்துவமனை எங்கே உள்ளது?',
    hi: 'अस्पताल कहाँ है?',
    te: 'ఆసుపత్రి ఎక్కడ ఉంది?',
    ml: 'ആശുപത്രി എവിടെയാണ്?',
    kn: 'ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?'
  },
  'Where is the restroom?': {
    en: 'Where is the restroom?',
    ta: 'கழிப்பறை எங்கே உள்ளது?',
    hi: 'शौचालय कहाँ है?',
    te: 'రెస్ట్‌రూమ్ ఎక్కడ ఉంది?',
    ml: 'റെസ്റ്റ് റൂം എവിടെയാണ്?',
    kn: 'ವಿಶ್ರಾಂತಿ ಕೊಠಡಿ ಎಲ್ಲಿದೆ?'
  },
  'How can I help you?': {
    en: 'How can I help you?',
    ta: 'நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    hi: 'मैं आपकी किस प्रकार सहायता कर सकता हूँ?',
    te: 'నేను మీకు ఎలా సహాయం చేయగలను?',
    ml: 'എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
    kn: 'ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?'
  },
  'Sure, I will get it.': {
    en: 'Sure, I will get it.',
    ta: 'நிச்சயமாக, நான் கொண்டு வருகிறேன்.',
    hi: 'ज़रूर, मैं इसे लेकर आता हूँ।',
    te: 'ఖచ్చితంగా, నేను తీసుకువస్తాను.',
    ml: 'തീർച്ചയായും, ഞാൻ അത് എടുക്കാം.',
    kn: 'ಖಂಡಿತ, ನಾನು ಅದನ್ನು ತರುತ್ತೇನೆ.'
  },
  'Nice to meet you.': {
    en: 'Nice to meet you.',
    ta: 'உங்களை சந்தித்ததில் மகிழ்ச்சி.',
    hi: 'आपसे मिलकर अच्छा लगा।',
    te: 'మిమ్మల్ని కలవడం ఆనందంగా ఉంది.',
    ml: 'നിങ്ങളെ കണ്ടതിൽ സന്തോഷം.',
    kn: 'ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿದ್ದಕ್ಕೆ ಸಂತೋಷವಾಯಿತು.'
  },
  'I am deaf and communicate using sign language.': {
    en: 'I am deaf and communicate using sign language.',
    ta: 'நான் காது கேளாதவர், சைகை மொழி மூலம் தொடர்பு கொள்கிறேன்.',
    hi: 'मैं बधिर हूँ और सांकेतिक भाषा का उपयोग करता हूँ।',
    te: 'నేను చెవిటివాడిని మరియు సంకేత భాషను ఉపయోగిస్తాను.',
    ml: 'ഞാൻ ബധിരനാണ്, ആംഗ്യഭാഷ ഉപയോഗിച്ച് ആശയവിനിമയം നടത്തുന്നു.',
    kn: 'ನಾನು ಕಿವುಡ ಮತ್ತು ಸಂಕೇತ ಭಾಷೆಯ ಮೂಲಕ ಸಂವಹನ ನಡೆಸುತ್ತೇನೆ.'
  }
};

/**
 * Translates an English sentence into the requested target language
 */
export function translateSentence(text: string, targetLang: SupportedLanguage): string {
  if (targetLang === 'en' || !text.trim()) return text;

  const normalized = text.trim();

  // 1. Direct match in dictionary
  if (TRANSLATION_MAP[normalized] && TRANSLATION_MAP[normalized][targetLang]) {
    return TRANSLATION_MAP[normalized][targetLang];
  }

  // 2. Partial / case-insensitive search
  for (const [key, translations] of Object.entries(TRANSLATION_MAP)) {
    if (key.toLowerCase() === normalized.toLowerCase()) {
      return translations[targetLang] || text;
    }
  }

  // 3. Fallback pattern-based translation
  if (targetLang === 'ta') {
    if (normalized.toLowerCase().includes('water')) return 'எனக்கு தண்ணீர் வேண்டும்.';
    if (normalized.toLowerCase().includes('help')) return 'எனக்கு உதவி தேவை.';
    if (normalized.toLowerCase().includes('food')) return 'எனக்கு உணவு வேண்டும்.';
    if (normalized.toLowerCase().includes('thank')) return 'மிக்க நன்றி.';
    if (normalized.toLowerCase().includes('stop')) return 'தயவுசெய்து நிறுத்துங்கள்.';
  } else if (targetLang === 'hi') {
    if (normalized.toLowerCase().includes('water')) return 'मुझे पानी चाहिए।';
    if (normalized.toLowerCase().includes('help')) return 'मुझे मदद चाहिए।';
    if (normalized.toLowerCase().includes('food')) return 'मुझे खाना चाहिए।';
    if (normalized.toLowerCase().includes('thank')) return 'बहुत धन्यवाद।';
    if (normalized.toLowerCase().includes('stop')) return 'कृपया रुकें।';
  } else if (targetLang === 'te') {
    if (normalized.toLowerCase().includes('water')) return 'నాకు నీళ్లు కావాలి.';
    if (normalized.toLowerCase().includes('help')) return 'నాకు సహాయం కావాలి.';
    if (normalized.toLowerCase().includes('food')) return 'నాకు ఆహారం కావాలి.';
    if (normalized.toLowerCase().includes('thank')) return 'ధన్యవాదాలు.';
  } else if (targetLang === 'ml') {
    if (normalized.toLowerCase().includes('water')) return 'എനിക്ക് വെള്ളം വേണം.';
    if (normalized.toLowerCase().includes('help')) return 'എനിക്ക് സഹായം വേണം.';
    if (normalized.toLowerCase().includes('food')) return 'എനിക്ക് ഭക്ഷണം വേണം.';
    if (normalized.toLowerCase().includes('thank')) return 'നന്ദി.';
  } else if (targetLang === 'kn') {
    if (normalized.toLowerCase().includes('water')) return 'ನನಗೆ ನೀರು ಬೇಕು.';
    if (normalized.toLowerCase().includes('help')) return 'ನನಗೆ ಸಹಾಯ ಬೇಕು.';
    if (normalized.toLowerCase().includes('food')) return 'ನನಗೆ ಊಟ ಬೇಕು.';
    if (normalized.toLowerCase().includes('thank')) return 'ಧನ್ಯವಾದಗಳು.';
  }

  return text;
}
