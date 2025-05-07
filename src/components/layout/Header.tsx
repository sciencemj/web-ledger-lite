import { PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { SettingsDropdown } from '@/components/settings/SettingsDropdown';

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary/80 transition-colors">
          <PiggyBank className="h-7 w-7" />
          <span>Web Ledger Lite</span>
        </Link>
        <SettingsDropdown />
      </div>
    </header>
  );
}
