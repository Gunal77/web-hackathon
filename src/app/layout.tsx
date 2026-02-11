import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ManuProvider } from "@/components/providers/ManuProvider";
import { RoleProvider } from "@/components/providers/RoleProvider";
import { ShellWrapper } from "@/components/layout/ShellWrapper";

export const metadata = {
  title: "Risk & Sentiment Aware Petition Grievance Intelligence Platform",
  description:
    "Decision-support dashboards for risk- and sentiment-aware grievance handling over Mudhalvarin Mugavari."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          <ManuProvider>
            <AuthProvider>
              <ShellWrapper>{children}</ShellWrapper>
            </AuthProvider>
          </ManuProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

