
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, X, Bot, Sparkles } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const AIAssistant: React.FC = () => {
  const { processVoiceCommand } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
     { role: 'bot', text: "I am StockBot. How can I help you manage your inventory today?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
       alert("Voice not supported in this browser. Please use Chrome.");
       return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
       const text = event.results[0][0].transcript;
       setTranscript(text);
       handleSend(text);
    };

    recognition.start();
  };

  const handleSend = async (textInput?: string) => {
    const text = textInput || transcript;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setTranscript('');
    setIsProcessing(true);

    const response = await processVoiceCommand(text);
    
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsProcessing(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 ${
            isOpen ? 'scale-0 opacity-0' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
        }`}
      >
         <Bot size={28} />
         <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
         </span>
      </button>

      {/* Chat Interface */}
      {isOpen && (
         <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-50 animate-fade-in-up transition-colors">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-2">
                  <Sparkles size={20} className="animate-pulse" />
                  <span className="font-bold text-lg">StockBot AI</span>
               </div>
               <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
               {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none shadow-sm'
                     }`}>
                        {m.text}
                     </div>
                  </div>
               ))}
               {isProcessing && (
                  <div className="flex justify-start">
                     <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex space-x-1">
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                     </div>
                  </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
               <div className="flex gap-2">
                  <button 
                     onClick={startListening}
                     className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                     <Mic size={20} />
                  </button>
                  <div className="flex-1 relative">
                     <input 
                        type="text" 
                        className="w-full h-full pl-4 pr-10 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Say 'Send 50 chairs...'"
                        value={transcript}
                        onChange={e => setTranscript(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                     />
                     <button 
                        onClick={() => handleSend()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 p-1"
                     >
                        <Send size={18} />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </>
  );
};
