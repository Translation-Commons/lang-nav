import { ChevronDownIcon } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import { navBarItemClassName } from './NavBarLink';
import { getToolURL, NAV_BAR_TOOLS, NavBarTool, useIsToolOpen } from './navBarTools';

const NavBarToolsMenu: React.FC = () => {
  const isToolOpen = useIsToolOpen();
  const isAnyToolOpen = NAV_BAR_TOOLS.some(isToolOpen);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-current={isAnyToolOpen ? 'page' : undefined}
        render={
          <Button variant="ghost" size="lg" className={navBarItemClassName(isAnyToolOpen)}>
            Tools
            <ChevronDownIcon className="size-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent className="w-max">
        {NAV_BAR_TOOLS.map((tool) => (
          <ToolMenuItem key={tool.label} tool={tool} isActive={isToolOpen(tool)} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ToolMenuItem: React.FC<{ tool: NavBarTool; isActive: boolean }> = ({ tool, isActive }) => {
  return (
    <DropdownMenuItem
      className={cn('cursor-pointer', isActive && 'font-medium')}
      aria-current={isActive ? 'page' : undefined}
      render={<Link to={getToolURL(tool)} />}
    >
      {tool.label}
    </DropdownMenuItem>
  );
};

export default NavBarToolsMenu;
