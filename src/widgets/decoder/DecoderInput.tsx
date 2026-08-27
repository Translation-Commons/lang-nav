import { Spinner } from '@shared/ui/spinner';

import { useDecoderDataContext } from './DecoderDataContext';

const DecoderInput = () => {
  const { setInputBlob, inputBlob, isInputPending } = useDecoderDataContext();

  return (
    <div className="flex flex-col w-40 flex-shrink-0">
      <div className="flex items-center gap-2">Enter languages {isInputPending && <Spinner />}</div>
      <textarea
        id="decoder-input"
        className="min-w-10 border p-2 min-h-100 field-sizing-content"
        value={inputBlob}
        onChange={(e) => setInputBlob(e.target.value)}
        placeholder="Paste a newline separated list of languages..."
      />
    </div>
  );
};

export default DecoderInput;
