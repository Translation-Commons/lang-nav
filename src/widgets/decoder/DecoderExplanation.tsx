import { DecoderDirection, useDecoderOptionsContext } from './DecoderOptionsContext';

const DecoderExplanation = () => {
  const { direction } = useDecoderOptionsContext();

  return (
    <div>
      This tool allows you to get language names from language codes, and vice versa. You can paste
      a list of languages separated by newline.{' '}
      {direction === DecoderDirection.NamesToCodes ? (
        <>
          To find the proper language codes for language names, there may be multiple spellings or
          name constructions, so this will honor filter settings and find the best match.
        </>
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
