import { XIcon } from 'lucide-react';

import { Button } from '@shared/ui/button';
import { Spinner } from '@shared/ui/spinner';

import { useDecoderDataContext } from './DecoderDataContext';

const DecoderInput = () => {
  const { setInputBlob, inputBlob, isInputPending } = useDecoderDataContext();

  return (
    <div className="flex flex-col min-w-40 flex-shrink-0">
      <div className="flex items-center gap-2 font-bold">
        Enter languages {isInputPending && <Spinner />}{' '}
        <Button
          aria-label="Clear entered languages"
          variant="ghost"
          size="icon"
          onClick={() => setInputBlob('')}
          disabled={!inputBlob}
        >
          <XIcon className="icon-sm" />
        </Button>
      </div>
      <textarea
        id="decoder-input"
        className="min-w-10 border p-2 min-h-100 field-sizing-content leading-[24px]"
        value={inputBlob}
        onChange={(e) => setInputBlob(e.target.value)}
        placeholder="Enter languages, separated by new lines..."
      />
    </div>
  );
};

export default DecoderInput;
