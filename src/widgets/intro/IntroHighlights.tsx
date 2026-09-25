import { GlobeIcon, LockOpenIcon, PersonStandingIcon } from 'lucide-react';
import React from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';

const HIGHLIGHTS = [
  { icon: GlobeIcon, title: 'All in one place', text: 'All language data, one platform.' },
  { icon: PersonStandingIcon, title: 'Inclusivity', text: 'Built to represent every language.' },
  { icon: LockOpenIcon, title: 'Free & open-source', text: 'Free to use, free to build on.' },
];

const IntroHighlights: React.FC = () => {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
        <Card key={title} className="text-center">
          <CardHeader className="justify-items-center">
            <Icon className="mb-1 size-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle>{title}</CardTitle>
            <CardDescription>{text}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default IntroHighlights;
