import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatView } from '@/components/ChatView';
import { SettingsModal } from '@/components/SettingsModal';

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar />
      <ChatView />
      <SettingsModal />
    </div>
  );
};

export default Index;