"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Trash2, User, Bot, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { queryBedrockAgent } from '@/lib/bedrockAgent';
import { useRouter } from 'next/navigation';

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

interface ChatAreaProps {
  conversation?: Conversation;
  onUpdateConversation: (id: string, updates: Partial<Conversation>) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ conversation, onUpdateConversation }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();
  const currentConversationRef = useRef(null);

  useEffect(() => {
    currentConversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages, isTyping]);

  const simulateTyping = async (text, conversationId, currentMessages) => {
    setIsTyping(true);
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      
      // Update the last message with typed text
      onUpdateConversation(conversationId, {
        messages: [
          ...currentMessages.slice(0, -1),
          {
            ...currentMessages[currentMessages.length - 1],
            content: currentText
          }
        ]
      });

      // Random delay between words for natural typing effect
      await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 40));
    }

    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    const questionText = input.trim();
    setInput('');

    // Update conversation title based on first message
    const updatedMessages = [...conversation.messages, userMessage];
    const updates = {
      messages: updatedMessages
    };

    if (conversation.messages.length === 0) {
      updates.title = questionText.slice(0, 50) + (questionText.length > 50 ? '...' : '');
    }

    onUpdateConversation(conversation.id, updates);

    // Get answer from RAG system
    setTimeout(() => {
      const answer = findAnswer(questionText);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      };

      const messagesWithAssistant = [...updatedMessages, assistantMessage];
      onUpdateConversation(conversation.id, {
        messages: messagesWithAssistant
      });

      // Start typing simulation
      setTimeout(() => {
        simulateTyping(answer, conversation.id, messagesWithAssistant);
      }, 300);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied.",
    });
  };

  const clearChat = () => {
    if (conversation && window.confirm('Clear all messages in this conversation?')) {
      onUpdateConversation(conversation.id, {
        messages: [],
        title: 'New Conversation'
      });
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Select or create a conversation to start</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">ECI Knowledge Assistant</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ask me anything about ECI</p>
        </div>
        {conversation.messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        {conversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Welcome to ECI Chat Agent</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-md">
              I'm here to help you understand the Enriched Customer Information system. Ask me about ECI overview, data integrity, APIs, troubleshooting, and more.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`group relative max-w-2xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100 dark:text-blue-200' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.content && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 ${
                          message.role === 'user'
                            ? 'text-blue-100 dark:text-blue-200 hover:text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about ECI..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white h-[60px] px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
