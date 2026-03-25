import { ReactNode } from 'react';

function DocsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      id={title.toLowerCase().replace(/\s+/g, '-')}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', marginBottom: '1em' }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export default DocsSection;
