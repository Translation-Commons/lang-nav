import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import { Orthography } from '@entities/orthography/OrthographyTypes';

import Deemphasized from '@shared/ui/Deemphasized';

import DetailsField from './ui/DetailsField';
import DetailsSection from './ui/DetailsSection';

type Props = {
    orthography: Orthography;
};

const OrthographyDetails: React.FC<Props> = ({ orthography }) => {
    const { language, writingSystem, baseCharacters } = orthography;

    return (
        <div className="Details">
            <DetailsSection title="Attributes">
                <DetailsField title="Base Characters">
                    {baseCharacters ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4em' }}>
                            {baseCharacters.split('').map((char, i) => (
                                <span
                                    key={i}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '2em',
                                        height: '2em',
                                        border: '1px solid var(--color-button-secondary)',
                                        borderRadius: '0.25em',
                                    }}
                                >
                                    {char}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <Deemphasized>Not available</Deemphasized>
                    )}
                </DetailsField>
            </DetailsSection>

            <DetailsSection title="Connections">
                <DetailsField title="Language">
                    {language ? <HoverableEntityName ent={language} /> : <Deemphasized>Unknown</Deemphasized>}
                </DetailsField>
                <DetailsField title="Writing System">
                    {writingSystem ? (
                        <HoverableEntityName ent={writingSystem} />
                    ) : (
                        <Deemphasized>Unknown</Deemphasized>
                    )}
                </DetailsField>
            </DetailsSection>
        </div>
    );
};

export default OrthographyDetails;