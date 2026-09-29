type Props = {
  chars: string;
};

function OrthographyCharacters({ chars }: Props) {
  return <span className="text-wrap line-clamp-2">{Array.from(chars).join('​')}</span>;
}

export default OrthographyCharacters;
