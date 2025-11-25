import {
  getBaseLanguageData,
  LanguageCode,
  LanguageField,
  LanguagesBySource,
  LanguageScope,
} from '@entities/language/LanguageTypes';

export enum RetirementReason {
  NonExistent = 'N',
  Duplicate = 'D',
  Split = 'S',
  Merged = 'M',
  NeverISO = 'Never ISO',
}

export type ISORetirementData = {
  id: LanguageCode; // ISO 639-3 code
  languageName: string; // Reference name of the language
  reason: RetirementReason; // Reason for retirement
  changeTo: LanguageCode; // Code or name to change to, if applicable
  remedy: string; // Remedy for the retirement
  effectiveDate: Date; // Date when the retirement is effective

  // Derived from "remedy"
  splitLanguages: LanguageCode[]; // If split, the new languages created
};

export async function loadISORetirements(): Promise<ISORetirementData[] | void> {
  return await fetch('data/iso/iso-639-3_Retirements.tab')
    .then((res) => res.text())
    .then((text) => {
      return text
        .split('\n')
        .slice(1)
        .map((line) => {
          const parts = line.split('\t');
          if (parts.length < 6) return null;
          const [id, refName, retReason, changeTo, retRemedy, effective] = line.split('\t');
          const reason = retReason.trim() as RetirementReason;
          let splitLanguages: LanguageCode[] = [];
          if (reason === RetirementReason.Split) {
            // eg. Split into six languages: Alapmunte [apv]; Lakondê [lkd]; Latundê [ltn]; Mamaindé [wmd]; Tawandê [xtw]; Yalakalore [xyl]
            splitLanguages = retRemedy.match(/\[([a-z]{3})\]/g)?.map((s) => s.slice(1, -1)) || [];
          }
          return {
            id: id.trim(),
            languageName: refName.trim(),
            reason,
            changeTo: changeTo.trim() as LanguageCode,
            remedy: retRemedy.trim(),
            effectiveDate: new Date(effective.trim()),
            splitLanguages,
          } as ISORetirementData;
        })
        .filter((item) => item !== null);
    })
    .catch((err) => console.error('Error loading TSV:', err));
}

export function addISORetirementsToLanguages(
  languagesBySource: LanguagesBySource,
  retirements: ISORetirementData[],
): void {
  retirements.forEach((retirement) => {
    let lang = languagesBySource.ISO[retirement.id];
    const retirementExplanation = getRetirementExplanation(retirement);

    // Remove the language links from ISO based sources or make a new language entry
    if (lang) {
      lang.warnings[LanguageField.isoCode] = retirementExplanation;
      // lang.ISO.scope = LanguageScope.SpecialCode; // Maybe

      // Remove from ISO-based language lists (we are just leaving it in the "All" source)
      delete languagesBySource.ISO[retirement.id];
      delete languagesBySource.BCP[retirement.id];
      delete languagesBySource.CLDR[retirement.id];
      delete languagesBySource.UNESCO[retirement.id];

      if (retirement.changeTo) {
        // If there's a changeTo, update the codeDisplay to the new code
        lang.ISO.parentLanguageCode = retirement.changeTo;
        lang.BCP.parentLanguageCode = retirement.changeTo;
      }
    } else {
      const childLanguages = retirement.splitLanguages
        .map((code) => languagesBySource.Combined[code])
        .filter((lang) => lang != null);

      lang = {
        ...getBaseLanguageData(retirement.id, retirement.languageName),
        scope: LanguageScope.SpecialCode,
        Combined: {
          code: retirement.id,
          name: retirement.languageName,
          scope: LanguageScope.SpecialCode,
          parentLanguageCode: retirement.changeTo || undefined,
          childLanguages,
        },
        ISO: { code: retirement.id },
      };

      // Add the language to the all list, but with the retirement warning
      languagesBySource.Combined[retirement.id] = lang;
    }

    // Add retirement information
    lang.ISO.retirementReason = retirement.reason;
    lang.warnings[LanguageField.isoCode] = retirementExplanation;
    lang.viabilityConfidence ??= 'No';
    lang.viabilityExplanation ??= retirementExplanation;
  });
}

function getRetirementExplanation(retirement: ISORetirementData): string {
  const stringStart = `The language code [${retirement.id}] was retired on ISO: `;
  const stringEnd = `Effective ${retirement.effectiveDate.toLocaleDateString()}.`;

  switch (retirement.reason) {
    case RetirementReason.NonExistent:
      return (
        stringStart +
        `Non-existent -- this language may have never existed. It was added to ISO but later removed. ` +
        stringEnd
      );
    case RetirementReason.Duplicate:
      return (
        stringStart +
        `Duplicate -- this language was determined to be a duplicate of \`${retirement.changeTo}\`. ` +
        stringEnd
      );
    case RetirementReason.Split:
      return stringStart + `${retirement.remedy}. ` + stringEnd;
    case RetirementReason.Merged:
      return (
        stringStart +
        `Merged -- this language was merged into \`${retirement.changeTo}\`. ` +
        stringEnd
      );
    case RetirementReason.NeverISO:
      return `Never ISO -- this language was never officially part of any ISO 639 standard.`;
  }
}

export function getRetirementReasonLabel(reason: RetirementReason): string | undefined {
  switch (reason) {
    case RetirementReason.NonExistent:
      return 'Non-Existent';
    case RetirementReason.Duplicate:
      return 'Duplicate';
    case RetirementReason.Split:
      return 'Split';
    case RetirementReason.Merged:
      return 'Merged';
    case RetirementReason.NeverISO:
      return 'Never ISO';
    default:
      return undefined;
  }
}
