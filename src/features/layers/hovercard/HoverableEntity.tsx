import { ArrowUpRightIcon } from 'lucide-react';
import React from 'react';

import InternalLink from '@features/params/InternalLink';
import { PageParams, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import FieldIcon from '@features/transforms/fields/FieldIcon';
import getField from '@features/transforms/fields/getField';

import { EntityData } from '@entities/types/EntityTypes';
import EntityTitle from '@entities/ui/EntityTitle';

import { unique } from '@shared/lib/setUtils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';

type Props = {
  ent?: EntityData;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const HoverableEntity: React.FC<Props> = ({ ent, children, style }) => {
  const { colorBy, sortBy, scaleBy, fieldFocus, updatePageParams } = usePageParams();
  const fields = unique([sortBy, colorBy, scaleBy, fieldFocus]).filter(
    (f) => f != Field.None && f != Field.Name && f != Field.Code,
  );

  if (ent == null) {
    return <>{children}</>;
  }

  const openDrawer = () => {
    const params: Partial<PageParams> = { entID: ent.ID };
    updatePageParams(params);
  };

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={300}
        closeDelay={100}
        render={
          <span
            className="hoverableText inline-block cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              openDrawer();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openDrawer();
              }
            }}
            role="button"
            style={style}
            tabIndex={0}
          >
            {children}
          </span>
        }
      />
      <HoverCardContent className="max-w-[300px] w-fit">
        <div className="flex flex-col gap-1">
          <div>
            <EntityTitle ent={ent} highlightSearchMatches={false} />
          </div>
          {fields.map((field) => {
            const res = getField(ent, field);
            if (res == null) return null;
            return (
              <div key={field} className="flex items-center gap-1">
                <FieldIcon field={field} />
                <EntityFieldDisplay ent={ent} field={field} />
              </div>
            );
          })}
          <span
            className="text-muted-foreground hover:underline hover:cursor-pointer"
            onClick={openDrawer}
          >
            Click to open details drawer
          </span>
          <InternalLink
            className="text-muted-foreground!"
            params={{ cmpID: ent.ID, entType: ent.type, view: View.Details }}
            newWindow={true}
          >
            or in a new window
            <ArrowUpRightIcon className="inline-block ml-1 size-3" />
          </InternalLink>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default HoverableEntity;
