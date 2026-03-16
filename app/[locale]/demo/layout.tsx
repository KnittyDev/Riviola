import { DemoLayoutClient } from "./DemoLayoutClient";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DemoLayoutClient>{children}</DemoLayoutClient>;
}
