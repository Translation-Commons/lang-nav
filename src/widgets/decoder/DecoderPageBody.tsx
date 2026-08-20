import { DecoderDataProvider } from './DecoderDataContext';
import DecoderExplanation from './DecoderExplanation';
import DecoderInput from './DecoderInput';
import DecoderTable from './DecoderTable';
import DecoderOptions from './options/DecoderOptions';
import { DecoderOptionsProvider } from './options/DecoderOptionsContext';

const DecoderPageBody = () => {
  return (
    <div className="px-4 py-4 overflow-auto flex-1">
      <DecoderOptionsProvider>
        <DecoderDataProvider>
          <div className="min-w-[600px]">
            <div className="text-3xl">Language Tag Decoder</div>
            <DecoderExplanation />
            <DecoderOptions />

            <div className="flex flex-row gap-4">
              <DecoderInput />
              <DecoderTable />
            </div>
          </div>
        </DecoderDataProvider>
      </DecoderOptionsProvider>
    </div>
  );
};

export default DecoderPageBody;
