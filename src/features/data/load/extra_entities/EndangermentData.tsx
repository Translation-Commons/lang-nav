import { LanguageData } from '@entities/language/LanguageTypes';
import { parseEndangerment } from '@entities/language/vitality/VitalityStrings';

const DEBUG = false;

// Glottolog:
// name	status	Glottocode
// Abaga	critically endangered	abag1245
// Abom	critically endangered	abom1238
// Achumawi	critically endangered	achu1247
// Ahtena	critically endangered	ahte1237

export async function loadGlottologEndangerment(
  getLanguage: (id: string) => LanguageData | undefined,
) {
  return await fetch('data/glottolog/endangerment.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').filter((line) => !line.startsWith('#') && line.trim() !== ''))
    .then((lines) => addEndangermentData(lines, getLanguage, 'Glottolog'))
    .catch((err) => console.error('Error loading TSV:', err));
}

// UNESCO
// Name	Color	Code
// Ahtna	r	aht
// Ainu	r	ain
// Aivilingmiutut	w	inui1246/mis
// Akkala Saami	b	sia

export async function loadUnescoEndangerment(
  getLanguage: (id: string) => LanguageData | undefined,
) {
  return await fetch('data/other_sources/unesco_endangerment.tsv')
    .then((res) => res.text())
    .then((text) => text.split('\n').filter((line) => !line.startsWith('#') && line.trim() !== ''))
    .then((lines) => addEndangermentData(lines, getLanguage, 'UNESCO'))
    .catch((err) => console.error('Error loading TSV:', err));
}

export async function addEndangermentData(
  lines: string[],
  getLanguage: (id: string) => LanguageData | undefined,
  source: 'Glottolog' | 'UNESCO',
) {
  lines.forEach((line) => {
    const [name, status, languageCode] = line.split('\t');
    if (!languageCode) {
      if (DEBUG) console.debug('addEndangermentData needs language code for: ', name);
      return;
    }
    const lang = getLanguage(languageCode);
    if (!lang) {
      if (DEBUG) console.debug('addEndangermentData needs proper language code for: ', name);
      return;
    }
    lang[source].endangerment = parseEndangerment(status);
  });
}
