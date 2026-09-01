import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import useUsers from "../../features/auth/hooks/useUsers";
import useAuthUser from "../../features/auth/hooks/useAuthUser";
import ChatBotWrapper from "../../features/chatbot/components/ChatBotWrapper";

export default function DashboardLayout({ children, onSearch }) {
  useAuthUser();
  const { user, fetchUser } = useUsers();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#e8ecf3]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:pl-64 min-h-screen flex flex-col">
        <header>
          <TopBar
            user={user}
            onSearch={onSearch}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {children}
          <ChatBotWrapper />
        </main>
      </div>

    </div>
  );
}
