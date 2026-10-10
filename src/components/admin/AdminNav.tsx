'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@/lib/auth';

export function AdminNav({ user }: { user: User }) {
  const path = usePathname();
  const owner = user.role === 'owner';
  const L = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} aria-current={(href === '/admin' ? path === href : path.startsWith(href)) ? 'page' : undefined}>{children}</Link>
  );
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }
  return (
    <aside className="adm-side">
      <div className="adm-side__brand"><strong>Website editor</strong><span>Majesty Method & TenderIQ</span></div>
      <nav aria-label="Editor">
        <L href="/admin">Dashboard</L>
        <h2>Content</h2>
        <L href="/admin/content">Pages</L>
        <L href="/admin/collections/webinars">Webinars</L>
        <L href="/admin/collections/courses">Courses</L>
        <L href="/admin/collections/resources">Free resources</L>
        <L href="/admin/media">Images</L>
        {owner && (<>
          <h2>Enquiries</h2>
          <L href="/admin/submissions">Submissions</L>
          <L href="/admin/consents">Marketing consent</L>
          <h2>Settings</h2>
          <L href="/admin/content/settings">Business details</L>
          <L href="/admin/forms">Forms</L>
          <L href="/admin/users">Users</L>
        </>)}
        <L href="/admin/account">My account</L>
      </nav>
      <div className="adm-side__foot">
        <span>{user.name} · {user.role}</span>
        <a href="/" target="_blank" rel="noopener" style={{ color: '#f3dca7' }}>View website</a>
        <button type="button" onClick={logout}>Sign out</button>
      </div>
    </aside>
  );
}
