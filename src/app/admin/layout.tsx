import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = { title: { absolute: 'Website editor' }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div data-brand="majesty">{children}</div>;
}
