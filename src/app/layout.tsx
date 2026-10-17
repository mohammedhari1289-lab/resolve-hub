import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "ResolveHub – Complaint Management System", template: "%s | ResolveHub" },
  description:
    "ResolveHub helps students and staff raise complaints, track every status change with a unique ID, and get issues resolved faster.",
  keywords: ["complaint management system", "grievance redressal", "campus helpdesk", "complaint tracking", "ResolveHub"],
  applicationName: "ResolveHub",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ResolveHub",
    title: "ResolveHub – Complaint Management System",
    description: "Raise a complaint, track it with a unique ID and see it resolved.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image", title: "ResolveHub – Complaint Management System", description: "Raise a complaint, track it with a unique ID and see it resolved." },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f6" },
    { media: "(prefers-color-scheme: dark)", color: "#080f16" },
  ],
};

const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
