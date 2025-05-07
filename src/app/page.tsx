
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && user)) { // Show loading/redirecting screen
     return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-lg text-muted-foreground">
            {isLoading ? 'Loading...' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // If not loading and no user, show login form
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
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        Enter your email and password to sign in.
      </p>
    </div>
  );
}

