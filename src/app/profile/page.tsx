"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        router.replace("/signin");
        return;
      }
      if (mounted) {
        setEmail(user.email ?? null);
        setName((user.user_metadata as any)?.name ?? null);
        setUserId(user.id);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600">Your account information</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl">
                  {(email?.[0] || "U").toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="mb-3 break-all">{userId}</p>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="mb-3">{email}</p>
                  {name ? (
                    <>
                      <p className="text-sm text-gray-500">Name</p>
                      <p>{name}</p>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={async () => { await supabase.auth.signOut(); router.replace("/signin"); }}
                >
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
