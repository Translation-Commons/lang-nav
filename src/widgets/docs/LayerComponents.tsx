import React, { useState } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import Modal from '@features/layers/modal/ModalButton';
import PopupCard from '@features/layers/popupcard/PopupCard';
import { getNewURL } from '@features/params/getNewURL';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';

import { toSentenceCase } from '@shared/lib/stringUtils';
import LinkButton from '@shared/ui/old/LinkButton';

import DocsCard from './DocsCard';
import DocsCardGrid from './DocsCardGrid';
import DocsSection from './DocsSection';

/**
 * Documentation explaining different layer components
 */
const LayerComponents: React.FC = () => {
  return (
    <DocsSection title="Layers">
      <div>
        To make the website interactive but maintain a clean structure, we use various layer
        components. These are reusable components to maintain a consistent style and user
        experience.
      </div>
      <DocsCard title="Hovercards">
        <div>
          Hovercards are used to show additional information when the user hovers over an element.
          They should be used for simple information that can be quickly consumed, such as a preview
          of a linked page or a definition of a term. At the moment they may contain their own
          interactive elements, but there may be difficulties using the interactive elements without
          accidentally dismissing the hovercard.
        </div>
        <div>
          Usually there is 1 hovercard per page that is reused, but you can add a{' '}
          <code>HoverCardProvider</code> to add a new hovercard. Nested hovercards are discouraged
          (it is easy to provide a poor UX with competing hover areas) but can also be done with an
          internal hovercard provider.
        </div>
        <div>
          <HoverableButton hoverContent="I show on hover">Hoverable button</HoverableButton>
        </div>
      </DocsCard>
      <DocsCard title="Popup Cards">
        Popup cards are used to show more complex information that the user may want to interact
        with, such as a list of view options. They include their own close button and persist on the
        page until the original button is clicked again, the close button is clicked, or the escape
        key is pressed.
        <PopupCard
          buttonLabel="Open popup card"
          description="Description of the popup card goes here."
          title="Popup Card Example"
          body="I am the content of the popup card. I can include interactive elements like buttons."
        />
      </DocsCard>
      <DocsCard title="Selector">
        Selectors are used for selecting from a list of options. There are various display styles:
        <DocsCardGrid>
          <DocsCard title="Dropdown">
            Standard compact selector
            <DropdownExample display={SelectorDisplay.Dropdown} />
          </DocsCard>
          <DocsCard title="Inline Dropdown">
            More compact, works in short text segments (does not support line wrapping well though).
            <DropdownExample display={SelectorDisplay.InlineDropdown} />
          </DocsCard>
          <DocsCard title="Button Group">
            When you want to show all options. Best with short options.
            <DropdownExample display={SelectorDisplay.ButtonGroup} />
          </DocsCard>
          <DocsCard title="Button List">
            When you want to show all options but enable wrapping.
            <DropdownExample display={SelectorDisplay.ButtonList} />
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
          <LinkButton href={LangNavPageName.Data + getNewURL({ objectID: '1' })}>
            Open data page with a right-hand panel open
          </LinkButton>
        </div>
      </DocsCard>
    </DocsSection>
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
