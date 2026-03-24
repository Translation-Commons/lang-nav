import { useDataContext } from '@features/data/context/useDataContext';
import React, { useState } from 'react';
import './CodeLookupPage.css';
import { batchLookup, BatchMatchResult } from './batchMatchLogic';

const CodeLookupPageBody: React.FC = () => {
    const { languagesInSelectedSource } = useDataContext();
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [statusMessages, setStatusMessages] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const isLoading = languagesInSelectedSource.length === 0;

    function handleLookup() {
        const lines = inputText.split('\n');
        const results: BatchMatchResult[] = batchLookup(lines, languagesInSelectedSource);

        const codes = results.map((r) => r.code);
        setOutputText(codes.join('\n'));

        const warnings: string[] = [];
        results.forEach((r, i) => {
            if (r.warning) {
                warnings.push(`Line ${i + 1}: ${r.warning}`);
            }
        });
        setStatusMessages(warnings);
        setCopied(false);
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(outputText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    }

    return (
        <div className="code-lookup-container">
            <h2>Language Code Lookup</h2>
            <p>
                Enter language names below (one per line) and click <strong>Look Up</strong> to get their
                language codes. Example: <code>Punjabi</code> &gt;&gt; <code>lah/pan</code>.
            </p>
            <div className="code-lookup-textareas">
                <div className="code-lookup-column">
                    <label htmlFor="batch-input">Language Names</label>
                    <textarea
                        id="batch-input"
                        className="code-lookup-textarea"
                        placeholder={'Example:\nUrdu\nPunjabi\nHindko'}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </div>
                <div className="code-lookup-column">
                    <label htmlFor="batch-output">Language Codes</label>
                    <textarea
                        id="batch-output"
                        className="code-lookup-textarea"
                        readOnly
                        value={outputText}
                    />
                </div>
            </div>
            <div className="code-lookup-actions">
                <button className="primary" onClick={handleLookup} disabled={isLoading || inputText.trim() === ''}>
                    {isLoading ? 'Loading data...' : 'Look Up'}
                </button>
                {outputText && (
                    <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Output'}</button>
                )}
            </div>
            {statusMessages.length > 0 && (
                <div className="code-lookup-status">
                    {statusMessages.map((msg, i) => (
                        <div key={i} className="warning">
                            {msg}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CodeLookupPageBody;
