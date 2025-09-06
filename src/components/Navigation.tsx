"use client";

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { User, LogIn, LogOut } from 'lucide-react';

export default function Navigation() {
  const { user, isAuthenticated, signOut } = useUser();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Smart PT
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/disruptions" className="text-gray-600 hover:text-gray-900">
              Disruptions
            </Link>
            <Link href="/trip-planner" className="text-gray-600 hover:text-gray-900">
              Trip Planner
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signin">
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}