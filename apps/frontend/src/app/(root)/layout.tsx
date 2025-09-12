import { DashboardHeader } from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <DashboardHeader />
    {children}
    </>
  );
}
