import type { ReactNode } from "react";
import "./globals.css";
import { RoleProvider } from "@/components/providers/RoleProvider";
import { ManuProvider } from "@/components/providers/ManuProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata = {
  title: "Risk & Sentiment Aware Manu Grievance Intelligence Platform",
  description:
    "Decision-support dashboards for risk- and sentiment-aware grievance handling over Mudhalvarin Mugavari."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          <ManuProvider>
            <AppShell>{children}</AppShell>
          </ManuProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

