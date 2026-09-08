import { ChevronDownIcon } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

import { navBarItemClassName } from './NavBarLink';
import {
  DECODER_TOOL,
  getToolURL,
  NAV_BAR_TOOLS,
  NavBarTool,
  REPORT_TOOLS,
  useIsToolOpen,
} from './navBarTools';

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
        <ToolMenuItem tool={DECODER_TOOL} isActive={isToolOpen(DECODER_TOOL)} />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Reports</DropdownMenuLabel>
          {REPORT_TOOLS.map((tool) => (
            <ToolMenuItem key={tool.label} tool={tool} isActive={isToolOpen(tool)} />
          ))}
        </DropdownMenuGroup>
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
