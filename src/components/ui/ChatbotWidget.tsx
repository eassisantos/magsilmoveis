'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, RotateCcw } from 'lucide-react';

type TextPart = { type: 'text'; text: string };

function getMessageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p): p is TextPart => p.type === 'text')
    .map(p => p.text)
    .join('');
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'Olá! 👋 Sou o assistente virtual da Magsil Móveis. Posso te ajudar com informações sobre produtos, personalização, entrega e muito mais. Como posso te ajudar?',
          },
        ],
      },
    ],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Scroll automático ao fundo
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focar input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const quickReplies = [
    'Como personalizar um produto?',
    'Quais são os materiais?',
    'Como funciona a entrega?',
    'Quero um orçamento',
  ];

  const showQuickReplies = messages.length <= 1 && !isLoading;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleQuickReply = (text: string) => {
    if (isLoading) return;
    sendMessage({ text });
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat de suporte'}
        className={`
          fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center transition-all duration-300
          ${isOpen
            ? 'bg-anthracite text-offwhite rotate-0 scale-90'
            : 'bg-gold text-anthracite hover:scale-110 hover:shadow-gold'
          }
        `}
        style={{ '--tw-shadow-gold': '0 0 20px rgba(197,163,96,0.4)' } as React.CSSProperties}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {/* Badge de notificação quando fechado */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            1
          </span>
        )}
      </button>

      {/* Janela do chat */}
      <div
        role="dialog"
        aria-label="Chat de suporte Magsil Móveis"
        aria-expanded={isOpen}
        className={`
          fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)]
          bg-white rounded-2xl shadow-2xl border border-gray-100
          flex flex-col overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
        style={{ height: '520px', maxHeight: 'calc(100vh - 120px)' }}
      >
        {/* Header */}
        <div className="bg-anthracite px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Assistente Magsil</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
              <p className="text-xs text-white/60">Online agora</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/50 hover:text-white transition-colors p-1 -mr-1 flex-shrink-0"
            aria-label="Fechar chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                  ${message.role === 'user' ? 'bg-gold text-anthracite' : 'bg-anthracite text-gold'}
                `}
              >
                {message.role === 'user'
                  ? <User className="w-3.5 h-3.5" />
                  : <Bot className="w-3.5 h-3.5" />
                }
              </div>

              {/* Balão */}
              <div
                className={`
                  max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${message.role === 'user'
                    ? 'bg-anthracite text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                  }
                `}
              >
                {getMessageText(message.parts)}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-anthracite flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-gold" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
              <p className="text-xs text-red-600 flex-1">
                Ocorreu um erro. Tente novamente.
              </p>
              <button
                onClick={() => regenerate()}
                className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                aria-label="Tentar novamente"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick replies */}
          {showQuickReplies && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickReplies.map(reply => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gold hover:text-gold transition-colors shadow-sm"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
          <form
            id="chat-form"
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              maxLength={500}
              className="
                flex-1 px-3.5 py-2.5 rounded-xl text-sm
                bg-gray-50 border border-gray-200
                focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30
                disabled:opacity-50 disabled:cursor-not-allowed
                placeholder-gray-400 text-gray-800
                transition-colors
              "
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors flex-shrink-0"
                aria-label="Parar resposta"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-anthracite text-gold flex items-center justify-center hover:bg-gold hover:text-anthracite transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
          <p className="text-center text-[10px] text-gray-300 mt-1.5">
            Powered by Magsil IA • Respostas automáticas
          </p>
        </div>
      </div>
    </>
  );
}
