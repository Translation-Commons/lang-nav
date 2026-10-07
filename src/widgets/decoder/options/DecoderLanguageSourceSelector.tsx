import LanguageStandardSelector from '@features/transforms/filtering/selectors/LanguageStandardSelector';

import { DecoderDirection, useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderLanguageSourceSelector: React.FC = () => {
  const { direction } = useDecoderOptionsContext();

  return (
    <tr>
      <td>
        {direction === DecoderDirection.CodesToNames ? 'Output name source' : 'Output code format'}
      </td>
      <td>
        <LanguageStandardSelector />
      </td>
    </tr>
  );
};

export default DecoderLanguageSourceSelector;
