import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Riftbound Field Notes — ค่อย ๆ เรียน แล้วค่อย ๆ เล่น',
  description: 'โต๊ะฝึก Riftbound ภาษาไทยสำหรับคนเริ่มจากศูนย์ ลองเล่นทีละก้าว พร้อมคำอธิบาย Rune การต่อสู้ และการทำแต้ม',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="th"><head><link rel="icon" href="/mark.svg" type="image/svg+xml" /></head><body>{children}</body></html>;
}
