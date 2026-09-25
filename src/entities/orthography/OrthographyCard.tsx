import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';

import { Orthography } from '@entities/orthography/OrthographyTypes';
import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/Deemphasized';

interface Props {
    orthography: Orthography;
}

const OrthographyCard: React.FC<Props> = ({ orthography }) => {
    const { language, writingSystem, baseCharacters } = orthography;

    return (
        <div>
            <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
                <EntityTitle ent={orthography} />
            </div>

            <CardField title="Language" field={Field.Language}>
                {language ? <HoverableEntityName ent={language} /> : <Deemphasized>Unknown</Deemphasized>}
            </CardField>

            <CardField title="Writing System" field={Field.WritingSystem}>
                {writingSystem ? (
                    <HoverableEntityName ent={writingSystem} />
                ) : (
                    <Deemphasized>Unknown</Deemphasized>
                )}
            </CardField>

            <CardField title="Base Characters" field={Field.Example}>
                {baseCharacters ? <span>{baseCharacters}</span> : <Deemphasized>Not available</Deemphasized>}
            </CardField>
        </div>
    );
};

export default OrthographyCard;