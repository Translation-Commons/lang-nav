import Deemphasized from '@shared/ui/Deemphasized';

import LanguagePluralCategory from './LanguagePluralCategory';
import { PluralRuleKey } from './LanguagePluralComputation';

function PluralRulesSummaryTable() {
  return (
    <table style={{ width: 'fit-content' }}>
      <thead>
        <tr>
          <th>Rule Key</th>
          <th>Formal Name</th>
          <th>Example Ranges</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Zero} />
          </td>
          <td>Privative</td>
          <td>0</td>
        </tr>
        <tr>
          <td>
            <LanguagePluralCategory pluralRuleKey={PluralRuleKey.One} />
          </td>
          <td>Singular</td>
          <td>1, 0-1</td>
        </tr>
        <tr>
          <td>
            <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Two} />
          </td>
          <td>Dual</td>
          <td>
            2 <Deemphasized>& 12? ...</Deemphasized>
          </td>
        </tr>
        <tr>
          <td>
            <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Few} />
          </td>
          <td>Trial or Paucal</td>
          <td>
            3, 2-3, 2-4 <Deemphasized>& 12-14? ...</Deemphasized>
          </td>
        </tr>
        <tr>
          <td>
            <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Many} />
          </td>
          <td>Greater plural or Fractional</td>
          <td>
            11+, 101+, 1 million <Deemphasized>or</Deemphasized> 0.0, 0.5, 1.0, ...
          </td>
        </tr>
        <tr>
          <td>
            <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Other} />
          </td>
          <td>Everything else</td>
          <td>
            2+, 3+, 10+ <Deemphasized>with or without 0</Deemphasized>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default PluralRulesSummaryTable;
