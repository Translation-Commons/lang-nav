import { DecoderDataProvider } from './DecoderDataContext';
import DecoderExplanation from './DecoderExplanation';
import DecoderInput from './DecoderInput';
import DecoderTable from './DecoderTable';
import DecoderOptions from './options/DecoderOptions';
import { DecoderOptionsProvider } from './options/DecoderOptionsContext';

const DecoderPageBody = () => {
  return (
    <div className="min-w-[900px] mx-auto px-4 py-4 overflow-auto">
      <DecoderOptionsProvider>
        <DecoderDataProvider>
          <div className="text-3xl">Language Tag Decoder</div>
          <DecoderExplanation />
          <DecoderOptions />

          <div className="flex flex-row gap-4">
            <DecoderInput />
            <DecoderTable />
          </div>
        </DecoderDataProvider>
      </DecoderOptionsProvider>
    </div>
  );
};

export default DecoderPageBody;
