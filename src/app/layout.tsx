import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookey",
  description: "책과 사람을 연결하는 Bookey",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
