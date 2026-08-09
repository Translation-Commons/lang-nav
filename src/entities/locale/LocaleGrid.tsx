import { LocaleData } from '@entities/locale/LocaleTypes';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import Deemphasized from '@shared/ui/Deemphasized';
import React from 'react';
import './LocaleGrid.css';
import LocaleGridCell from './LocaleGridCell';

type Props = {
    locales: LocaleData[]
    emptyMessage: string
}

const LocaleGrid: React.FC<Props> = ({ locales, emptyMessage }) => {
    const [isOpen, setIsOpen] = React.useState(true);


    if ((locales.length ?? 0) === 0) {
        return <Deemphasized>{emptyMessage}</Deemphasized>;
    }
    return (

        <>  {/* was <div>, now a Fragment (or inline-flex div) */}
            <HoverableButton
                onClick={() => setIsOpen((prev) => !prev)}
                style={{ padding: '0.25em' }}
                hoverContent={isOpen ? 'Click to hide locales' : 'Click to show locales'}
            >
                {isOpen ? 'hide locales' : 'show locales'}
            </HoverableButton>
            {isOpen && (
                <div className="localeGrid">
                    {locales.map((locale) => (
                        <LocaleGridCell key={locale.ID} locale={locale} />
                    ))}
                </div>
            )}
        </>

    )
}

export default LocaleGrid;
