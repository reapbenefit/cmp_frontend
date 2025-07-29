"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TreePine, Users, Recycle, Heart, Sprout, BookOpen } from "lucide-react";
import ChatSidebar, { SidebarToggle } from "@/components/ChatSidebar";
import InputArea from "@/components/InputArea";
import AuthWrapper from "@/components/AuthWrapper";
import { useAuth } from "@/lib/auth";

// Example Actions component
const ExampleActions = ({ onExampleClick }: { onExampleClick: (text: string) => void }) => {
  const examples = [
    { icon: TreePine, text: "Planted trees", color: "text-green-600", starter: "Today I planted trees in my neighborhood to help combat climate change. " },
    { icon: Recycle, text: "Organized cleanup", color: "text-blue-600", starter: "I organized a community cleanup drive to keep our local area clean. " },
    { icon: Users, text: "Helped neighbors", color: "text-purple-600", starter: "I helped my neighbors with their daily needs and built stronger community bonds. " },
    { icon: Sprout, text: "Started garden", color: "text-emerald-600", starter: "I started a community garden to promote sustainable living and fresh produce. " },
    { icon: Heart, text: "Volunteered", color: "text-red-500", starter: "I volunteered my time for a local cause that I care deeply about. " },
    { icon: BookOpen, text: "Taught skills", color: "text-orange-600", starter: "I taught valuable skills to community members to help them grow. " }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 md:mb-8">
      <p className="text-center text-gray-600 mb-4 text-sm font-medium">
        💡 Examples to get you started
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {examples.map((example, index) => {
          const Icon = example.icon;
          return (
            <div
              key={index}
              onClick={() => onExampleClick(example.starter)}
              className="bg-white/60 backdrop-blur-sm rounded-lg p-1 md:p-3 shadow-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-200 cursor-pointer group h-16 flex items-center justify-center"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${example.color} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`} />
                <span className="text-sm text-gray-700 font-medium leading-tight">{example.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [action, setAction] = useState("");

  // Initialize sidebar state - always closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId, userEmail } = useAuth();

  // Set initial sidebar state based on screen size after component mounts
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768; // 768px is md breakpoint in Tailwind
      setIsSidebarOpen(!isMobile); // Only open on desktop (>= 768px)
    };

    // Set initial state
    checkScreenSize();

    // Optional: Listen for window resize to handle orientation changes
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleExampleClick = (text: string) => {
    setAction(text);
  };

  const handleInputSubmit = async (type: 'text' | 'audio', content: string | Blob) => {
    if (!userEmail) {
      alert('Please login to submit an action');
      return;
    }

    setIsSubmitting(true);

    if (type === 'audio') {
      // Here you would typically upload the audio blob to your server
      console.log('Submitting audio recording:', content);
      // Simulate API delay for audio
      setTimeout(() => {
        alert('Voice recording submitted successfully! 🥷✨');
        setIsSubmitting(false);
      }, 1500);
    } else if (typeof content === 'string' && content.trim()) {
      try {
        // Make API call to create action
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/actions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_email: userEmail, user_message: content }),
        });

        if (!response.ok) {
          throw new Error('Failed to create action');
        }

        const responseData = await response.json();
        const actionData = responseData.action;

        // Navigate to chat page
        router.push(`/chat/${actionData.uuid}`);
      } catch (error) {
        console.error('Error creating action:', error);
        alert('Failed to create action. Please try again.');
        setIsSubmitting(false);
      }
    }

    // Reset action (only if not navigating away)
    if (type === 'audio') {
      setAction("");
    } else {
      // For text submissions, don't reset here as we're navigating away
      // The reset will happen on navigation or error
    }
  };

  const handleNewChat = () => {
    setIsSidebarOpen(false);
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <AuthWrapper>
      <div className="relative flex h-screen bg-gray-50">
        {/* Mobile backdrop overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <ChatSidebar
          currentChatId=""
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <div className="p-4 flex items-center gap-3 h-16 flex-shrink-0">
            <SidebarToggle isOpen={isSidebarOpen} onToggle={toggleSidebar} />
          </div>

          {/* Main content - Mobile: flex layout with sticky input, Desktop: centered layout */}
          <div className="flex-1 overflow-hidden md:overflow-y-auto">
            <div className="h-full bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
                <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
              </div>

              {/* Mobile Layout: Flex column with sticky input */}
              <div className="relative z-10 h-full flex flex-col md:hidden">
                {/* Content area - scrollable */}
                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
                  <div className="max-w-4xl mx-auto">
                    {/* Hero section */}
                    <div className="text-center mb-6 max-w-2xl mx-auto">
                      <div className="mb-4">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                          Solve Ninja Movement
                        </h1>
                        <p className="text-lg text-gray-700 mb-4">
                          India&apos;s Largest Changemaker Community
                        </p>
                        <p className="text-base text-gray-600 mb-6">
                          Share your latest community action and inspire others to join the movement
                        </p>
                      </div>

                      {/* Example Actions */}
                      <ExampleActions onExampleClick={handleExampleClick} />
                    </div>
                  </div>
                </div>

                {/* Input area - sticky to bottom on mobile */}
                <div className="flex-shrink-0 p-4 pt-2 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
                  <div className="w-full max-w-2xl mx-auto">
                    <InputArea
                      placeholder="What action did you take today?"
                      value={action}
                      onChange={setAction}
                      onSubmit={handleInputSubmit}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Layout: Centered layout */}
              <div className="relative z-10 px-4 py-8 md:py-16 hidden md:block">
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
                    {/* Hero section */}
                    <div className="text-center mb-8 max-w-2xl">
                      <div className="mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                          Solve Ninja Movement
                        </h1>
                        <p className="text-xl text-gray-700 mb-8">
                          India&apos;s Largest Changemaker Community
                        </p>
                        <p className="text-lg text-gray-600 mb-8">
                          Share your latest community action and inspire others to join the movement
                        </p>
                      </div>

                      {/* Example Actions */}
                      <ExampleActions onExampleClick={handleExampleClick} />
                    </div>

                    {/* Input area - centered on desktop */}
                    <div className="w-full max-w-2xl">
                      <InputArea
                        placeholder="What action did you take today?"
                        value={action}
                        onChange={setAction}
                        onSubmit={handleInputSubmit}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
