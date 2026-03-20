'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sidebar } from './sidebar';

export function Header({ title }: { title?: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background px-4 lg:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          }
        />
        <SheetContent side="left" className="w-56 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>
      {title && (
        <h1 className="text-lg font-semibold">{title}</h1>
      )}
      <div className="ml-auto">
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-1.5 size-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
