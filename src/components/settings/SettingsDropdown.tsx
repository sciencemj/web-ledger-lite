
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CURRENCY_OPTIONS } from '@/lib/consts';
import type { CurrencyCode } from '@/lib/types'; // Theme type removed as it's inferred
import { useCurrency } from '@/context/CurrencyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { Moon, Sun, UserCircle, Palette, DollarSignIcon, Mail as MailIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function SettingsDropdown() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth(); // Get user from AuthContext

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <UserCircle className="h-6 w-6" />
          <span className="sr-only">User Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {user?.email && ( // Display user email if available
          <>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent cursor-default text-sm">
              <MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate" title={user.email}>{user.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent">
          <div className="flex items-center justify-between w-full">
            <Label htmlFor="dark-mode-toggle" className="flex items-center gap-2 cursor-pointer">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Dark Mode
            </Label>
            <Switch
              id="dark-mode-toggle"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeChange}
              aria-label="Toggle dark mode"
            />
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
            <DollarSignIcon className="h-4 w-4" />
            Preferences
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent">
          <div className="w-full space-y-1.5">
            <Label htmlFor="currency-select">Currency</Label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
              <SelectTrigger id="currency-select" className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
