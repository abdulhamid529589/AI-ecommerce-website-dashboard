import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, X, Clock, User } from 'lucide-react'
import api from '../lib/axios'
import io from 'socket.io-client'
import '../styles/ChatManagement.css'

/**
 * Chat Management Page for Admin Dashboard
 * Allows admins to view and respond to customer chats
 */
const ChatManagement = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [replyMessage, setReplyMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  // Load all conversations
  useEffect(() => {
    loadConversations()
  }, [])

  // Initialize Socket.io for real-time updates
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin
    socketRef.current = io(`${socketUrl}/chat`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    socketRef.current.on('new-message', (data) => {
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        setMessages((prev) => [...prev, data])
      }
      // Refresh conversations list to show latest message
      loadConversations()
    })

    socketRef.current.on('connect', () => {
      console.log('✅ Chat socket connected for admin')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [selectedConversation])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load all conversations
  const loadConversations = async () => {
    setLoading(true)
    try {
      const response = await api.get('/chat/admin/conversations')
      console.log('✅ Conversations loaded:', response.data)
      setConversations(response.data.conversations || [])
    } catch (error) {
      console.error('❌ Failed to load conversations:', error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  // Load conversation messages
  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation)
    setMessages([])
    try {
      const response = await api.get(`/chat/${conversation.id}/messages`)
      console.log('✅ Messages loaded for conversation:', conversation.id, response.data)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('❌ Failed to load messages:', error.response?.data || error.message)
    }
  }

  // Send reply
  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      // Send message via Socket.io
      socketRef.current.emit('send-message', {
        conversationId: selectedConversation.id,
        message: replyMessage,
        isOwner: true,
      })

      setReplyMessage('')
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSending(false)
    }
  }

  // Close conversation
  const handleCloseConversation = async (conversationId) => {
    if (!window.confirm('Are you sure you want to close this conversation?')) return

    try {
      await api.put(`/chat/${conversationId}/close`)
      setSelectedConversation(null)
      await loadConversations()
    } catch (error) {
      console.error('Failed to close conversation:', error)
    }
  }

  return (
    <div className="chat-management">
      <div className="chat-management-header">
        <MessageSquare size={28} />
        <h1>Customer Chat Management</h1>
      </div>

      <div className="chat-container">
        {/* Conversations List */}
        <div className="conversations-panel">
          <h2>Conversations ({conversations.length})</h2>

          {loading ? (
            <div className="loading">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={32} />
              <p>
                <strong>No conversations yet</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                Customers will appear here once they start chatting.
              </p>
              <p style={{ fontSize: '12px', color: '#888' }}>
                Make sure the chat button is visible on your website.
              </p>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${
                    selectedConversation?.id === conv.id ? 'active' : ''
                  }`}
                  onClick={() => selectConversation(conv)}
                >
                  <div className="conv-header">
                    <div className="conv-user">
                      <User size={16} />
                      <span className="conv-name">{conv.user_name}</span>
                    </div>
                    <span className={`conv-status ${conv.status}`}>{conv.status}</span>
                  </div>
                  <p className="conv-subject">{conv.subject}</p>
                  <div className="conv-meta">
                    <Clock size={12} />
                    <span>
                      {new Date(conv.last_message_at || conv.created_at).toLocaleString()}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="unread-badge">{conv.unread_count} new</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="chat-panel">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="chat-header">
                <div className="header-info">
                  <h3>{selectedConversation.user_name}</h3>
                  <p className="header-subject">{selectedConversation.subject}</p>
                </div>
                <div className="header-actions">
                  <span className={`status-badge ${selectedConversation.status}`}>
                    {selectedConversation.status}
                  </span>
                  {selectedConversation.status === 'open' && (
                    <button
                      className="close-btn"
                      onClick={() => handleCloseConversation(selectedConversation.id)}
                    >
                      <X size={18} />
                      Close
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="messages-area">
                {messages.length === 0 ? (
                  <div className="empty-messages">No messages yet</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-bubble ${msg.is_owner || msg.isOwner ? 'owner' : 'customer'}`}
                    >
                      <div className="message-body">
                        <p className="message-sender">
                          {msg.is_owner || msg.isOwner
                            ? '👨‍💼 You'
                            : `👤 ${selectedConversation.user_name}`}
                        </p>
                        <p className="message-text">{msg.message}</p>
                        <span className="message-time">
                          {new Date(msg.created_at || msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              {selectedConversation.status === 'open' && (
                <form className="reply-form" onSubmit={handleSendReply}>
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" disabled={!replyMessage.trim() || sending}>
                    <Send size={18} />
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              )}

              {selectedConversation.status === 'closed' && (
                <div className="closed-message">This conversation is closed</div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <MessageSquare size={48} />
              <p>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatManagement
