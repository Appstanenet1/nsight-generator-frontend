import AppShell from '@/app/_components/app-shell';
import { WorkspaceProvider } from '@/app/_components/workspace-provider';

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
