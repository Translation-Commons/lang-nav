import React, { Suspense } from 'react';

import Loading from '@widgets/Loading';

const PageParamsProvider = React.lazy(() => import('@features/params/PageParamsProvider'));
const DataProvider = React.lazy(() => import('@features/data/context/DataProvider'));
const CodeLookupPageBody = React.lazy(() => import('./CodeLookupPageBody'));

const CodeLookupPage: React.FC = () => {
    return (
        <Suspense fallback={<Loading />}>
            <PageParamsProvider>
                <DataProvider>
                    <CodeLookupPageBody />
                </DataProvider>
            </PageParamsProvider>
        </Suspense>
    );
};

export default CodeLookupPage;
