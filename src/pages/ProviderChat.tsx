import React, { useState, useEffect, useRef } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import ProviderHeader from '../components/ProviderHeader';
import { chatService } from '../service/chatService';
import { authService } from '../service/authService';
import type { ChatConversation, ChatMessage } from '../types/chat';
import '../components/ProviderLayout.css';
import './ProviderChat.css';

const ProviderChat: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user info and type
  const currentUser = authService.getStoredUser();
  const userType = authService.getStoredUserType(); // 'user' or 'provider'

  // Get the full name based on user type
  const currentUserFullName = currentUser
    ? (userType === 'provider' ? currentUser.full_name : currentUser.full_name)
    : '';

  console.log('ProviderChat - Current User:', currentUser);
  console.log('ProviderChat - User Type:', userType);
  console.log('ProviderChat - Current User Full Name:', currentUserFullName);

  useEffect(() => {
    loadConversations();

    // Poll for conversation list updates every 5 seconds
    const conversationPollInterval = setInterval(() => {
      refreshConversations();
    }, 5000);

    return () => clearInterval(conversationPollInterval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);

      // Set up polling for real-time messages
      const pollInterval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(pollInterval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();

      // Sort conversations by last message timestamp (most recent first)
      const sortedConversations = data.sort((a, b) => {
        const dateA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
        const dateB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setConversations(sortedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);

      // Mark all unread messages as read
      const unreadMessages = data.filter(msg => !msg.is_read && msg.sender_name !== currentUserFullName);
      for (const message of unreadMessages) {
        try {
          await chatService.markMessageAsRead(conversationId, message.id);
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      }

      // Refresh conversation list to update unread count badge
      if (unreadMessages.length > 0) {
        await refreshConversations();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const newMessage = await chatService.sendTextMessage(
        selectedConversation.id,
        messageInput
      );
      setMessages([...messages, newMessage]);
      setMessageInput('');

      // Refresh conversation list to update the preview
      await refreshConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const refreshConversations = async () => {
    try {
      const data = await chatService.getConversations();

      // Sort conversations by last message timestamp (most recent first)
      const sortedConversations = data.sort((a, b) => {
        const dateA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
        const dateB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
        return dateB - dateA;
      });

      setConversations(sortedConversations);
    } catch (error) {
      console.error('Failed to refresh conversations:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="provider-layout">
        <ProviderSidebar />
        <div className="main-content">
          <ProviderHeader />
          <div className="provider-chat-content">
            <div className="loading">Loading conversations...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-layout">
      <ProviderSidebar />
      <div className="main-content">
        <ProviderHeader />
        <div className="provider-chat-content">
          <div className="chat-container">
            <div className="chat-sidebar">
              <div className="chat-sidebar-header">
                <h2>Messages</h2>
              </div>
              <div className="conversations-list">
                {conversations.length === 0 ? (
                  <div className="no-conversations">No conversations yet</div>
                ) : (
                  conversations.map((conv) => {
                    // Find the other participant (user in this case)
                    const otherParticipant = conv.participants.find(p => p.actor_type === 'user');
                    const displayName = conv.title || otherParticipant?.name || 'Unknown';

                    // Get proper initials from the name
                    const getInitials = (name: string) => {
                      const parts = name.trim().split(' ');
                      if (parts.length >= 2) {
                        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                      }
                      return name.charAt(0).toUpperCase();
                    };

                    // Format last message time
                    const formatLastMessageTime = (dateString?: string) => {
                      if (!dateString) return '';

                      const date = new Date(dateString);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffDays = Math.floor(diffMs / 86400000);

                      if (diffMins < 1) return 'Just now';
                      if (diffMins < 60) return `${diffMins}m ago`;
                      if (diffHours < 24) return `${diffHours}h ago`;
                      if (diffDays === 1) return 'Yesterday';
                      if (diffDays < 7) return `${diffDays}d ago`;

                      // For older messages, show date
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    };

                    return (
                      <div
                        key={conv.id}
                        className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <div className="conversation-avatar">
                          {getInitials(displayName)}
                        </div>
                        <div className="conversation-info">
                          <div className="conversation-header-row">
                            <div className="conversation-name">
                              {displayName}
                            </div>
                            {conv.last_message?.created_at && (
                              <div className="conversation-time">
                                {formatLastMessageTime(conv.last_message.created_at)}
                              </div>
                            )}
                          </div>
                          <div className="conversation-last-message">
                            {conv.last_message?.body || 'No messages yet'}
                          </div>
                        </div>
                        {conv.unread_count > 0 && (
                          <div className="unread-badge">{conv.unread_count}</div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="chat-main">
              {selectedConversation ? (
                <>
                  <div className="chat-header">
                    <div className="chat-header-info">
                      <h3>
                        {selectedConversation.title ||
                         selectedConversation.participants.find(p => p.actor_type === 'user')?.name ||
                         'Unknown'}
                      </h3>
                    </div>
                  </div>

                  <div className="messages-container">
                    {messages.length === 0 ? (
                      <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        // Check if this is a provider account viewing the chat
                        const isProviderAccount = userType === 'provider';

                        // Compare sender name with current user's full name (case-insensitive)
                        const messageSenderName = message.sender_name.toLowerCase().trim();
                        const currentName = currentUserFullName.toLowerCase().trim();

                        // Message is "sent" if the sender matches the current user
                        const isSent = messageSenderName === currentName ||
                                       message.sender_name === 'You';

                        console.log('Message:', {
                          id: message.id,
                          sender: message.sender_name,
                          messageSenderName,
                          currentName,
                          isSent,
                          isProviderAccount
                        });

                        return (
                          <div
                            key={message.id}
                            className={`message ${isSent ? 'message-sent' : 'message-received'}`}
                          >
                            <div className="message-content">
                              {!isSent && (
                                <div className="message-sender-name">
                                  {message.sender_name}
                                </div>
                              )}
                              <div className="message-body">{message.body}</div>
                              <div className="message-time">{formatTime(message.created_at)}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="message-input-container">
                    <input
                      type="text"
                      className="message-input"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={sendingMessage}
                    />
                    <button
                      className="send-button"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendingMessage}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-conversation-selected">
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderChat;
