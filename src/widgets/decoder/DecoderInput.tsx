import { useDecoderDataContext } from './DecoderDataContext';

const DecoderInput = () => {
  const { inputLines, setInputLines } = useDecoderDataContext();

  return (
    <div>
      Paste languages here
      <textarea
        className="w-full border p-2 min-h-100"
        value={inputLines}
        onChange={(e) => setInputLines(e.target.value)}
        placeholder="Paste a newline separated list of languages..."
      />
    </div>
  );
};

export default DecoderInput;
