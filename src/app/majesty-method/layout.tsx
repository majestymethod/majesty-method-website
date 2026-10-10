import { BrandShell } from '@/components/BrandShell';

export default function MajestyLayout({ children }: { children: React.ReactNode }) {
  return <BrandShell brand="majesty">{children}</BrandShell>;
}
