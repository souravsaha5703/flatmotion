import { useState, useEffect, useRef } from 'react';
import type { Chat } from '@/utils/AppInterfaces';
import { Link } from 'react-router-dom';
import { Clock, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import Loader from '@/components/loader';

interface Chats extends Chat {
    created_at: string
}

const ChatHistory = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [chats, setChats] = useState<Chats[]>([]);
    const { session } = useAuth();
    const hasFetchedRef = useRef(false);

    const fetchAllChats = async () => {
        if (!session?.access_token) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/get_all_chats`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        "x-refresh-token": session.refresh_token,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );
            setChats(response.data.chats);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (!hasFetchedRef.current && session) {
            hasFetchedRef.current = true;
            fetchAllChats();
        }
    }, [session]);

    setTimeout(() => {
        setLoading(false);
    }, 1000);

    const formatTimestamp = (created_at: Date | string) => {
        const date = new Date(created_at);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };
    return (
        <div className="min-h-screen bg-neutral-800">
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="max-w-4xl mx-auto flex items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center mb-8">
                            <Clock className="h-8 w-8 text-blue-500 mr-3" />
                            <h1 className="text-3xl font-bold text-white font-noto">Chat History</h1>
                        </div>

                        {chats.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                                <h2 className="text-xl font-noto font-semibold text-gray-300 mb-2">No chat history</h2>
                                <p className="text-gray-400 font-noto font-normal">Start a conversation to see your chat history here.</p>
                                <Link
                                    to="/chat"
                                    className="inline-block font-noto mt-4 bg-gray-100 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Start New Chat
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chats.map((chat) => (
                                    <Link
                                        key={chat.id}
                                        to={`/chat/${chat.id}`}
                                        className="block bg-neutral-700 rounded-lg p-6 hover:bg-neutral-600 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-white mb-2 truncate font-noto">
                                                    {chat.chatName}
                                                </h3>
                                                <div className="flex items-center font-noto text-xs text-gray-400 space-x-4">
                                                    <span className="flex items-center">
                                                        <MessageCircle className="h-3 w-3 mr-1" />
                                                        {chat.messages.length} messages
                                                    </span>
                                                    <span>{formatTimestamp(chat.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatHistory;