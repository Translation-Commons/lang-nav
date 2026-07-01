import { BanIcon } from 'lucide-react';
import React from 'react';

import SelectorLabel from '@features/params/ui/SelectorLabel';
import usePageParams from '@features/params/usePageParams';

const ClearAllPinsButton: React.FC = () => {
    const { pinned, updatePageParams } = usePageParams();

    const onClearClick = () => { updatePageParams({ pinned: [] }); };

    return (
        pinned.length > 0 && (
            <div className="selector" style={{ display: 'flex', alignItems: 'center' }}>
                <SelectorLabel
                    label="Clear All Pins"
                    description="Remove all pinned cards from the page."
                />
                <button
                    aria-label="Clear all pinned cards"
                    className="selected ClearAllPinsButton-button"
                    onClick={onClearClick}
                >
                    <BanIcon className="ClearAllPinsButton-iconBan" size="1em" />
                </button >
            </div>)
    );
};

export default ClearAllPinsButton;
