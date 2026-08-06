import { ReactNode } from 'react';

function DocsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section id={title.toLowerCase().replace(/\s+/g, '-')} className="mb-4 flex flex-col gap-2">
      <h2 className="m-0">{title}</h2>
      {children}
    </section>
  );
}

export default DocsSection;
