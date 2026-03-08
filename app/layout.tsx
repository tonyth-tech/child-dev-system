import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ระบบพัฒนาการเด็กปฐมวัย ศพด.',
  description: 'ศูนย์พัฒนาเด็กเล็กตำบลเหมืองจี้ อ.เมือง จ.ลำพูน',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
