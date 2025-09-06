"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, Route, User, LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setEmail(data.session?.user?.email ?? null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const navItems = [
    { href: '/disruptions', label: 'Disruptions', icon: AlertCircle },
    { href: '/trip-planner', label: 'Trip Planner', icon: Route },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PT</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Smart PT</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            {email ? (
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(v => !v)}
                  className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center"
                  aria-haspopup="menu"
                  aria-expanded={openMenu}
                >
                  {(email[0] || 'U').toUpperCase()}
                </button>
                {openMenu && (
                  <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md z-50">
                    <div className="px-3 py-2 text-xs text-gray-500 truncate">{email}</div>
                    <button
                      onClick={() => { setOpenMenu(false); router.push('/profile'); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      Profile
                    </button>
                    <button
                      onClick={async () => { setOpenMenu(false); await getSupabaseClient().auth.signOut(); router.replace('/signin'); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
