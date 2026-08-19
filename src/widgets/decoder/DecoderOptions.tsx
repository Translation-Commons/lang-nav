import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import LanguageSourceSelector from '@features/transforms/filtering/selectors/LanguageSourceSelector';

import { DecoderDirection, useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderOptions: React.FC = () => {
  const { direction, setDirection, includeMacroCodes, setIncludeMacroCodes } =
    useDecoderOptionsContext();

  return (
    <div className="flex flex-row gap-4 items-center m-2">
      <div className="font-bold">Options</div>
      <div className="flex flex-col gap-2 ">
        <div className="flex flex-row gap-2 items-center">
          Language code format and list of languages{' '}
          <LanguageSourceSelector display={SelectorDisplay.ButtonList} />
        </div>
        <div className="flex gap-2">
          <button
            className={direction === DecoderDirection.NamesToCodes ? 'primary' : ''}
            onClick={() => setDirection(DecoderDirection.NamesToCodes)}
          >
            Names → Codes
          </button>
          <button
            className={direction === DecoderDirection.CodesToNames ? 'primary' : ''}
            onClick={() => setDirection(DecoderDirection.CodesToNames)}
          >
            Codes → Names
          </button>
        </div>
        <div>
          <label>
            <input
              className="mr-2"
              type="checkbox"
              checked={includeMacroCodes}
              onChange={(e) => setIncludeMacroCodes(e.target.checked)}
            />
            Include macro codes
          </label>
        </div>
      </div>
    </div>
  );
};

export default DecoderOptions;
