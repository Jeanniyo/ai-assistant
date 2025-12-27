import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function ChatInterface() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your personal assistant. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/chat/history')
                if (res.data && res.data.length > 0) {
                    setMessages(res.data)
                }
            } catch (error) {
                console.error("Failed to fetch history", error)
            }
        }
        fetchHistory()
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await axios.post('/api/chat', { message: userMsg.content })
            const botMsg = { role: 'assistant', content: res.data.reply }
            setMessages(prev => [...prev, botMsg])
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl flex items-start gap-3 ${msg.role === 'user' ? 'bg-purple-600/50 rounded-tr-none' : 'bg-white/10 rounded-tl-none'
                                } backdrop-blur-sm border border-white/5`}>
                                <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-purple-400/20' : 'bg-blue-400/20'}`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div>{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="glass-input flex-1"
                />
                <button type="submit" className="glass-button" disabled={loading}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}
