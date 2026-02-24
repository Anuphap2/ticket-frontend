import React from "react";
import { Navbar } from "@/components/Navbar";
import { CurtainLayout } from "@/components/CurtainLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CurtainLayout>{children}</CurtainLayout>
    </>
  );
}
