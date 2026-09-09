import React from 'react';
import { NavLink } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { cn } from '@shared/lib/utils';
import { buttonVariants } from '@shared/ui/button';

export function navBarItemClassName(isActive: boolean): string {
  return cn('text-sm', isActive ? 'bg-accent' : 'font-normal');
}

export function navBarLinkClassName(isActive: boolean): string {
  return cn(buttonVariants({ variant: 'ghost', size: 'lg' }), navBarItemClassName(isActive));
}

type Props = React.PropsWithChildren<{ page: LangNavPageName }>;

const NavBarLink: React.FC<Props> = ({ page, children }) => {
  return (
    <NavLink
      to={'/' + page}
      data-slot="button"
      className={({ isActive }) => navBarLinkClassName(isActive)}
    >
      {children}
    </NavLink>
  );
};

export default NavBarLink;
