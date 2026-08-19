import { useEffect } from 'react';

import { useDecoderDataContext } from './DecoderDataContext';

const DecoderInput = () => {
  const { setInputLines, setInputBlob, inputBlob } = useDecoderDataContext();

  // Debounce the input to update the input lines only after the input blob changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setInputLines(inputBlob.split('\n'));
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputBlob, setInputLines]);

  return (
    <div>
      Paste languages here
      <textarea
        id="decoder-input"
        className="w-full border p-2 min-h-100 h-stretch"
        value={inputBlob}
        onChange={(e) => setInputBlob(e.target.value)}
        placeholder="Paste a newline separated list of languages..."
      />
    </div>
  );
};

export default DecoderInput;
