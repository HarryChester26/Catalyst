"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">

          <div className="relative">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpenMenu((v) => !v)}
                className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center focus:outline-none"
                aria-haspopup="menu"
                aria-expanded={openMenu}
              >
                {(email?.[0] || 'U').toUpperCase()}
              </button>
            </div>
            {openMenu && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md z-10">
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
        </div>
        <div className="rounded-xl border bg-white p-6">
          <p className="text-gray-700">Welcome! You have successfully signed in.</p>
        </div>
      </div>
    </div>
  );
}


