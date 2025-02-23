import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";

import { useTheme } from "next-themes";
import { supabase } from "~/lib/supabase/client";

export default function Home() {
  const { setTheme } = useTheme();

  const handleLogout = () => {
    void supabase.auth.signOut();
  };
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-3xl text-primary">Hello World</h1>
        <Button>Ayo Sentuh Aku</Button>
        <Button onClick={() => setTheme("dark")} size="icon">
          <Moon />
        </Button>
        <Button onClick={() => setTheme("light")} size="icon">
          <Sun />
        </Button>
        <Button onClick={handleLogout} variant="destructive">
          Keluar
        </Button>
      </main>
    </>
  );
}
