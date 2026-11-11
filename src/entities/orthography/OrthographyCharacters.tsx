import Deemphasized from '@shared/ui/Deemphasized';

type Props = {
  chars: string;
  empty?: React.ReactNode;
};

function OrthographyCharacters({ chars, empty }: Props) {
  if (!chars) return <>{empty ?? <Deemphasized>Not available</Deemphasized>}</>;
  return <span className="text-wrap line-clamp-2">{Array.from(chars).join('​')}</span>;
}

export default OrthographyCharacters;
