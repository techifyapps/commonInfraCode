import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Trash2, User, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '../hooks/use-toast';
import { findAnswer } from '../utils/ragSystem';

const ChatArea = ({ conversation, onUpdateConversation }) => {
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
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">ECI Knowledge Assistant</h1>
          <p className="text-xs text-slate-500">Ask me anything about ECI</p>
        </div>
        {conversation.messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome to ECI Chat Agent</h2>
            <p className="text-slate-600 max-w-md">
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
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`group relative max-w-2xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.content && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 ${
                          message.role === 'user'
                            ? 'text-blue-100 hover:text-white hover:bg-blue-700'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white text-slate-800 border border-slate-200 rounded-lg p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about ECI..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white h-[60px] px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
