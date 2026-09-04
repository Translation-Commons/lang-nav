import React, { useState } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import Modal from '@features/layers/modal/ModalButton';
import { getNewURL } from '@features/params/getNewURL';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';

import { toSentenceCase } from '@shared/lib/stringUtils';
import { Button } from '@shared/ui/button';
import { ButtonGroup } from '@shared/ui/button-group';
import LinkButton from '@shared/ui/LinkButton';

import DocsCard from './DocsCard';
import DocsCardGrid from './DocsCardGrid';
import DocsSection from './DocsSection';

/**
 * Documentation explaining different layer components
 */
const LayerComponents: React.FC = () => {
  return (
    <>
      Note that as we migrate the website to the shadcn UI library, some of the examples below may
      not be up to date with the current design system.
      <DocsSection title="Layers">
        <div>
          To make the website interactive but maintain a clean structure, we use various layer
          components. These are reusable components to maintain a consistent style and user
          experience.
        </div>
        <DocsCard title="Hovercards">
          <div>
            Hovercards are used to show additional information when the user hovers over an element.
            They should be used for simple information that can be quickly consumed, such as a
            preview of a linked page or a definition of a term. At the moment they may contain their
            own interactive elements, but there may be difficulties using the interactive elements
            without accidentally dismissing the hovercard.
          </div>
          <div>
            Usually there is 1 hovercard per page that is reused, but you can add a{' '}
            <code>HoverCardProvider</code> to add a new hovercard. Nested hovercards are discouraged
            (it is easy to provide a poor UX with competing hover areas) but can also be done with
            an internal hovercard provider.
          </div>
          <div>
            <HoverableButton hoverContent="I show on hover">Hoverable button</HoverableButton>
          </div>
        </DocsCard>
        <DocsCard title="Selector">
          Selectors are used for selecting from a list of options. There are various display styles:
          <DocsCardGrid>
            <DocsCard title="Inline Dropdown">
              More compact, works in short text segments (does not support line wrapping well
              though).
              <DropdownExample display={SelectorDisplay.InlineDropdown} />
            </DocsCard>
            <DocsCard title="Button Group">
              When you want to show all options. Best with short options. Use the shadcn{' '}
              <code>&lt;ButtonGroup&gt;</code> component.
              <ButtonGroup>
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </ButtonGroup>
            </DocsCard>
            <DocsCard title="Vertical List">
              When showing options in a vertical column. If the list is too long it is clipped.
              <DropdownExample display={SelectorDisplay.FilterList} />
            </DocsCard>
          </DocsCardGrid>
        </DocsCard>
        <DocsCard title="Modals">
          Modals are used for important interactions that require focused attention, such as
          confirming a destructive action or filling out a form. They should be used sparingly and
          should include clear options for closing the modal without taking the primary action.
          <div>
            <Modal
              buttonLabel="Open modal"
              description="I am a modal"
              title="Modal Example"
              body="I am the content of the modal. I can include interactive elements like buttons."
            />
          </div>
        </DocsCard>
        <DocsCard title="Panels">
          Panels are used to display content in a side or bottom drawer. They can be used for
          navigation, settings, or additional information. Panels should be used when the content is
          secondary to the main content and can be temporarily hidden. Right now the only available
          panel is the entity details.
          <div>
            <LinkButton href={LangNavPageName.Data + getNewURL({ entID: '1' })}>
              Open data page with a right-hand panel open
            </LinkButton>
          </div>
        </DocsCard>
      </DocsSection>
    </>
  );
};

const DropdownExample: React.FC<{ display: SelectorDisplay }> = ({ display }) => {
  const [selected, setSelected] = useState('Option 2');
  return (
    <Selector
      display={display}
      selectorLabel={'Example ' + toSentenceCase(display)}
      selectorDescription="Selector description goes here."
      options={['Option 1', 'Option 2', 'Option 3', 'Option 4']}
      onChange={setSelected}
      selected={selected}
      getOptionDescription={(v) => v + ' description'}
    />
  );
};

export default LayerComponents;
