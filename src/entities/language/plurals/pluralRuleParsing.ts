// 3 main parts "conditions" "@integer examples" "@decimal examples"
export function parsePluralRuleEquation(rule: string): {
  conditions: string;
  integerExamples?: string;
  decimalExamples?: string;
} {
  const [conditions, integerExamples, decimalExamples] = rule
    .match(/([^@]*)(?:@integer ([^@]*))?(?:@decimal ([^@]*))?/)!
    .slice(1);
  return {
    conditions: conditions.trim(),
    integerExamples,
    decimalExamples,
  };
}
