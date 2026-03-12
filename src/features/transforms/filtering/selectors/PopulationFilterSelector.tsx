import React, { useState } from 'react';

import usePageParams from '@features/params/usePageParams';

const PopulationFilterSelector: React.FC = () => {
    const { populationLowerLimit, populationUpperLimit, updatePageParams } = usePageParams();

    // Local state to avoid input jumping or effect loops while typing
    const [minInput, setMinInput] = useState<string | undefined>(undefined);
    const [maxInput, setMaxInput] = useState<string | undefined>(undefined);

    const displayMin = minInput !== undefined ? minInput : (populationLowerLimit ?? '');
    const displayMax = maxInput !== undefined ? maxInput : (populationUpperLimit ?? '');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
            <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25em' }}>Min Population</label>
                <span style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5em' }}>
                    Filter results to show only items with population above this threshold
                </span>
                <div
                    style={{
                        border: '0.125em solid var(--color-button-primary)',
                        display: 'flex',
                        justifyContent: 'left',
                        width: 'fit-content',
                        borderRadius: '1em',
                        gap: '0.5em',
                        paddingLeft: '0.5em',
                    }}
                >
                    <input
                        type="number"
                        value={displayMin}
                        onChange={(e) => setMinInput(e.target.value)}
                        style={{
                            width: '6em',
                            border: 'none',
                            lineHeight: '1.5em',
                            background: 'none',
                            marginLeft: '0.25em',
                            color: 'var(--color-button-primary)',
                            outline: 'none',
                        }}
                        placeholder="0"
                    />
                    <button
                        onClick={() => {
                            const val = parseInt(minInput || '');
                            updatePageParams({ populationLowerLimit: isNaN(val) ? undefined : val });
                            setMinInput(undefined); // Reset local state so it pulls from pageParams
                        }}
                        className={populationLowerLimit !== undefined ? 'primary' : undefined}
                    >
                        Set Min
                    </button>
                </div>
            </div>

            <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25em' }}>Max Population</label>
                <span style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5em' }}>
                    Filter results to show only items with population below this threshold
                </span>
                <div
                    style={{
                        border: '0.125em solid var(--color-button-primary)',
                        display: 'flex',
                        justifyContent: 'left',
                        width: 'fit-content',
                        borderRadius: '1em',
                        gap: '0.5em',
                        paddingLeft: '0.5em',
                    }}
                >
                    <input
                        type="number"
                        value={displayMax}
                        onChange={(e) => setMaxInput(e.target.value)}
                        style={{
                            width: '6em',
                            border: 'none',
                            lineHeight: '1.5em',
                            background: 'none',
                            marginLeft: '0.25em',
                            color: 'var(--color-button-primary)',
                            outline: 'none',
                        }}
                        placeholder="∞"
                    />
                    <button
                        onClick={() => {
                            const val = parseInt(maxInput || '');
                            updatePageParams({ populationUpperLimit: isNaN(val) ? undefined : val });
                            setMaxInput(undefined); // Reset local state so it pulls from pageParams
                        }}
                        className={populationUpperLimit !== undefined && populationUpperLimit !== Number.MAX_SAFE_INTEGER ? 'primary' : undefined}
                    >
                        Set Max
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopulationFilterSelector;