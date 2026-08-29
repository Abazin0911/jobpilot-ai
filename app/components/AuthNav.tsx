"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthNav() {
  const router = useRouter(); const [user, setUser] = useState<{ email: string } | null>(null);
  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((data) => setUser(data.user)).catch(() => undefined); }, []);
  const signOut = async () => { await fetch("/api/auth/signout", { method: "POST" }); setUser(null); router.push("/"); };
  return user ? <div className="flex items-center gap-3 text-sm"><span className="hidden text-slate-500 sm:inline">{user.email}</span><Link href="/history" className="font-medium text-slate-600 hover:text-slate-900">History</Link><button onClick={signOut} className="font-medium text-slate-600 hover:text-slate-900">Sign out</button></div> :
    <div className="flex items-center gap-3 text-sm"><Link href="/signin" className="hidden font-medium text-slate-600 hover:text-slate-900 sm:inline">Sign in</Link><Link href="/signup" className="font-medium text-slate-600 hover:text-slate-900">Create account</Link></div>;
}
