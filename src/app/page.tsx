'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank } from 'lucide-react';
import Image from 'next/image';


export default function LoginPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already "logged in" (mocked)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      if (loggedInStatus) {
        setIsLoggedIn(true);
        router.replace('/dashboard');
      }
    }
  }, [router]);


  const handleLoginSuccess = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
    }
    setIsLoggedIn(true);
    router.push('/dashboard');
  };

  // If already logged in (e.g. refresh on dashboard), prevent login page flash
  if (isLoggedIn) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <PiggyBank className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/50 p-4 selection:bg-primary/20 selection:text-primary">
      <div className="absolute inset-0 opacity-50">
        {/* You can add a subtle background pattern or image here if desired */}
      </div>
      <Card className="w-full max-w-md shadow-2xl z-10 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
             <Image src="https://picsum.photos/seed/piggybank/100/100" alt="Web Ledger Lite Logo" width={80} height={80} className="rounded-full shadow-md" data-ai-hint="piggy bank finance" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Web Ledger Lite</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Sign in to manage your finances with ease.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        Don&apos;t have an account? This is a demo. Any credentials will work.
      </p>
    </div>
  );
}
