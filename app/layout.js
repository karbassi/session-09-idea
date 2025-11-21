import './globals.css'
import { salonConfig } from '../config'

export const metadata = {
  title: salonConfig.businessName,
  description: `Book your appointment at ${salonConfig.businessName}`,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
