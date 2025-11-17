"use client";

import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">ECIChatAgent</h2>
        </div>
        <Button
          onClick={onNewConversation}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                currentConversationId === conversation.id
                  ? 'bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 flex-shrink-0" />
                    <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {conversation.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(conversation.createdAt)} • {conversation.messages.length} messages
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;
