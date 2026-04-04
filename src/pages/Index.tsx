import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatView } from '@/components/ChatView';
import { SettingsModal } from '@/components/SettingsModal';
import { TitleBar } from '@/components/TitleBar';

const Index = () => {
  return (
    // Reverted back to a standard flex container so the sidebar goes top-to-bottom natively
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      <TitleBar /> 
      <ChatSidebar />
      <ChatView />
      <SettingsModal />
    </div>
  );
};

export default Index;