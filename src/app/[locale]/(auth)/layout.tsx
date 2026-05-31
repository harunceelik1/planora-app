import { ModeToggle } from "@/features/components/theme/mode-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,120,120,0.12),_transparent_38%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_34%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-border/80" />

        <div className="relative mx-auto flex min-h-screen max-w-screen-2xl flex-col p-4">
          <div className="flex items-center justify-end pt-2">
            <ModeToggle />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-6 md:py-10">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
