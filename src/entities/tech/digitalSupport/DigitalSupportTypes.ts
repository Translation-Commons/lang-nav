export enum DigitalSupportTier {
  Communication,
  Content,
  Interfaces,
}

export const AllDigitalSupportTiers = Object.values(DigitalSupportTier).filter(
  (v) => typeof v === 'number',
);

export enum DigitalSupportCategory {
  // Communication
  Display,
  Keyboards,
  AssistiveTools,

  // Content
  Documentation,
  CurrencyAndDates,
  MachineTranslation,
  // Speech,
  // Recommendation,

  // Interfaces
  OperatingSystems,
  // SocialMedia,
  // PopularSoftware,
  AIKnowledgeTools,
}

export const AllDigitalSupportCategories = Object.values(DigitalSupportCategory).filter(
  (v) => typeof v === 'number',
);

export enum DigitalSupportFactor {
  /** Communication */
  // Display
  UnicodeEncoding,

  // Keyboards
  Keyman,
  Gboard,

  // Assistive Tools
  Grammarly,
  QuillBot,
  LanguageTool,

  /** Content */
  // Documentation
  Wikipedia,
  UDHR, // UniversalDeclarationOfHumanRights

  // CurrencyAndDates,
  CLDR,

  // MachineTranslation
  GTranslate,
  MSTranslator,

  // Speech
  // Recommendation

  /** Interfaces */
  // OperatingSystems
  Win11,
  macOS,
  iOS,
  Android,

  // SocialMedia

  // PopularSoftware

  // AIKnowledgeTools
  ClaudeSonnet,
}

export const DigitalSupportTierCategories: Record<DigitalSupportTier, DigitalSupportCategory[]> = {
  [DigitalSupportTier.Communication]: [
    DigitalSupportCategory.Display,
    DigitalSupportCategory.Keyboards,
    DigitalSupportCategory.AssistiveTools,
  ],
  [DigitalSupportTier.Content]: [
    DigitalSupportCategory.Documentation,
    DigitalSupportCategory.CurrencyAndDates,
    DigitalSupportCategory.MachineTranslation,
    // DigitalSupportCategory.Speech,
    // DigitalSupportCategory.Recommendation,
  ],
  [DigitalSupportTier.Interfaces]: [
    DigitalSupportCategory.OperatingSystems,
    // DigitalSupportCategory.SocialMedia,
    // DigitalSupportCategory.PopularSoftware,
    DigitalSupportCategory.AIKnowledgeTools,
  ],
};

export const DigitalSupportCategoryFactors: Record<DigitalSupportCategory, DigitalSupportFactor[]> =
  {
    [DigitalSupportCategory.Display]: [DigitalSupportFactor.UnicodeEncoding],
    [DigitalSupportCategory.Keyboards]: [DigitalSupportFactor.Keyman, DigitalSupportFactor.Gboard],
    [DigitalSupportCategory.AssistiveTools]: [
      DigitalSupportFactor.Grammarly,
      DigitalSupportFactor.QuillBot,
      DigitalSupportFactor.LanguageTool,
    ],

    [DigitalSupportCategory.Documentation]: [
      DigitalSupportFactor.Wikipedia,
      DigitalSupportFactor.UDHR,
    ],
    [DigitalSupportCategory.CurrencyAndDates]: [DigitalSupportFactor.CLDR],
    [DigitalSupportCategory.MachineTranslation]: [
      DigitalSupportFactor.GTranslate,
      DigitalSupportFactor.MSTranslator,
    ],
    // [DigitalSupportCategory.Speech]: [],
    // [DigitalSupportCategory.Recommendation]: [],

    [DigitalSupportCategory.OperatingSystems]: [
      DigitalSupportFactor.Win11,
      DigitalSupportFactor.macOS,
      DigitalSupportFactor.iOS,
      DigitalSupportFactor.Android,
    ],
    // [DigitalSupportCategory.SocialMedia]: [],
    // [DigitalSupportCategory.PopularSoftware]: [],
    [DigitalSupportCategory.AIKnowledgeTools]: [DigitalSupportFactor.ClaudeSonnet],
  };

export function getDigitalSupportCategoryForFactor(
  factor: DigitalSupportFactor,
): DigitalSupportCategory | undefined {
  for (const [cat, factors] of Object.entries(DigitalSupportCategoryFactors)) {
    if (factors.includes(factor))
      return DigitalSupportCategory[cat as keyof typeof DigitalSupportCategory];
  }
  return undefined;
}

export type DigitalSupportColumn = {
  tier: DigitalSupportTier;
  cat?: DigitalSupportCategory;
  factor?: DigitalSupportFactor;
  showData?: boolean;
};
