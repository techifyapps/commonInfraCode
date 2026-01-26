"use client";

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import ConversationSidebar from './ConversationSidebar';
import ChatArea from './ChatArea';
import StatsPanel from './StatsPanel';
import { Button } from './ui/button';
import { initialStats } from '@/lib/mock';
import { Toaster } from './ui/toaster';

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [stats, setStats] = useState(initialStats);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('eci_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Load conversations - start fresh, no persistence
  useEffect(() => {
    // Always start with a fresh conversation on login
    const initialConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setConversations([initialConv]);
    setCurrentConversationId(initialConv.id);
  }, []);

  // Do NOT save conversations to localStorage - keep them in memory only
  // They will be cleared on logout or page refresh

  // Animate statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        latency: +(prev.latency + (Math.random() - 0.5) * 0.3).toFixed(2),
        totalEvents: prev.totalEvents + Math.floor(Math.random() * 50),
        newCustomers: prev.newCustomers + Math.floor(Math.random() * 5),
        uniqueCustomers: prev.uniqueCustomers + Math.floor(Math.random() * 20)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('eci_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('eci_theme', 'light');
    }
  };

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (updated.length === 0) {
        const newConv: Conversation = {
          id: Date.now().toString(),
          title: 'New Conversation',
          messages: [],
          createdAt: new Date().toISOString()
        };
        setCurrentConversationId(newConv.id);
        return [newConv];
      }
      if (currentConversationId === id) {
        setCurrentConversationId(updated[0].id);
      }
      return updated;
    });
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  return (
    <>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 relative">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Light
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </>
            )}
          </Button>
        </div>

        {/* Left Sidebar - Conversations */}
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onNewConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
        />

        {/* Center - Chat Area */}
        <ChatArea
          conversation={currentConversation}
          onUpdateConversation={updateConversation}
        />

        {/* Right Sidebar - Statistics */}
        <StatsPanel stats={stats} />
      </div>
      <Toaster />
    </>
  );
};

export default ChatInterface;
