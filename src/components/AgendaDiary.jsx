import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Calendar, Book } from 'lucide-react'

export default function AgendaDiary() {
    const [agenda, setAgenda] = useState([])
    const [diary, setDiary] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [agendaRes, diaryRes] = await Promise.all([
                    axios.get('/api/agenda'),
                    axios.get('/api/diary')
                ])
                setAgenda(agendaRes.data)
                setDiary(diaryRes.data)
            } catch (err) {
                console.error("Failed to fetch data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) return (
        <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
    )

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <motion.section initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="text-purple-400" size={20} />
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Agenda</h2>
                </div>
                <div className="space-y-3">
                    {agenda.length === 0 ? <p className="text-white/30 italic">No agenda items yet.</p> : agenda.map((item, i) => (
                        <motion.div variants={itemVariants} key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="flex justify-between items-start">
                                <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">{item.content}</span>
                                {item.date && <span className="text-xs bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2 py-1 rounded-full whitespace-nowrap">{item.date}</span>}
                            </div>
                            {item.timestamp && <div className="text-xs text-white/30 mt-2">{new Date(item.timestamp).toLocaleString()}</div>}
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            <motion.section initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}>
                <div className="flex items-center gap-2 mb-4">
                    <Book className="text-blue-400" size={20} />
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Diary</h2>
                </div>
                <div className="space-y-3">
                    {diary.length === 0 ? <p className="text-white/30 italic">No diary entries yet.</p> : diary.map((entry, i) => (
                        <motion.div variants={itemVariants} key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <p className="text-white/80 leading-relaxed font-serif">{entry.content}</p>
                            {entry.timestamp && <div className="text-xs text-white/30 mt-3 text-right italic">{new Date(entry.timestamp).toLocaleString()}</div>}
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </div>
    )
}
