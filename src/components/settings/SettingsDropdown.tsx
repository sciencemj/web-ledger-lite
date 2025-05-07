'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CURRENCY_OPTIONS } from '@/lib/consts';
import type { CurrencyCode, Theme } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { Moon, Sun, UserCircle, Palette, DollarSignIcon } from 'lucide-react';
import React from 'react';

export function SettingsDropdown() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // For DropdownMenuRadioGroup approach to theme
  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme as Theme);
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

        {/* Alternative: Radio group for light/dark/system - uncomment to use this and comment out Switch */}
        {/* <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeSelect}>
          <DropdownMenuRadioItem value="light" className="flex items-center gap-2">
            <Sun className="h-4 w-4" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="flex items-center gap-2">
            <Moon className="h-4 w-4" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup> */}
        
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
