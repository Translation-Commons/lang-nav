import { DecoderDirection, useDecoderOptionsContext } from './options/DecoderOptionsContext';

const DecoderExplanation = () => {
  const { direction } = useDecoderOptionsContext();

  return (
    <div>
      This tool allows you to get language names from language codes, and vice versa. You can paste
      a list of languages separated by newline.{' '}
      {direction === DecoderDirection.NamesToCodes ? (
        <>Note that most languages have multiple names and ways to spell those names.</>
      ) : (
        <>
          Language codes are matched to language names deterministically, following the ISO 639
          standard (3 letter or 2 letter), otherwise the glottocode.
        </>
      )}
    </div>
  );
};

export default DecoderExplanation;
