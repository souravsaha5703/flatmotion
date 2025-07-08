import { useState, useRef, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/chatSidebar';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { MoveUp } from 'lucide-react';
import { easeIn, easeInOut, motion } from 'motion/react';
import type { Message } from '@/utils/AppInterfaces';
import { useParams } from 'react-router-dom';
import Loader from '@/components/loader';
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabaseConfig';

const ChatPage = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [videoLoading, setVideoLoading] = useState<boolean>(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState<string>("");
    const [videoGenerateState, setVideoGenerateState] = useState<string>('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { id } = useParams();
    const { session, setSession } = useAuth();
    const hasFetchedRef = useRef(false);

    const fetchMessages = async () => {
        if (!session?.access_token || !id) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/get_messages/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        "x-refresh-token": session.refresh_token,
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );
            setChatMessages(response.data.data[0].messages);
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        if (!hasFetchedRef.current && session && id) {
            hasFetchedRef.current = true;
            fetchMessages();
        }
    }, [session, id]);

    setTimeout(() => {
        setLoading(false);
    }, 1000);

    const handleChatBtn = async () => {
        if (prompt.trim() !== '') {
            const tempId = crypto.randomUUID();
            const newMessage: Message = {
                id: tempId,
                userMessage: prompt,
                videoScript: '',
                videoUrl: '',
            }

            setChatMessages(prev => [...prev, newMessage]);
            setPrompt('');
            if (session?.access_token) {
                const access_token = session.access_token;
                setVideoLoading(true);
                try {
                    const response = await axios.put(
                        `${import.meta.env.VITE_SERVER_URL}/add_message`,
                        { prompt: prompt, chat_id: id },
                        {
                            headers: {
                                Authorization: `Bearer ${access_token}`,
                                "x-refresh-token": session.refresh_token,
                                'Content-Type': 'application/json',
                            },
                            withCredentials: true
                        },
                    );
                    const { job_id } = response.data;
                    await connectWebSocket(job_id, tempId);

                } catch (error) {
                    console.error(error);
                }
                finally {
                    setVideoLoading(false);
                    setVideoGenerateState('');
                }
            }
        }
    }

    const connectWebSocket = async (job_id: string, tempId: string) => {
        let access_token = session?.access_token;

        if (!access_token) {
            console.warn("Access token expired or missing. Refreshing...");
            const { data, error } = await supabase.auth.refreshSession();
            if (error || !data.session) {
                console.error("Failed to refresh session:", error);
                return;
            }
            access_token = data.session.access_token;
            setSession(data.session);
        }

        const socket = new WebSocket(`${import.meta.env.VITE_SERVER_WS_URL}/ws/jobs/${job_id}?token=${access_token}`);

        socket.onopen = () => {
            console.log("Web socket connection opened");
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.status === 'completed') {
                setVideoGenerateState(data.message);
                setChatMessages(prev =>
                    prev.map((msg) =>
                        msg.id == tempId ? { ...msg, videoUrl: data.video_url, videoScript: data.script } : msg)
                );
                socket.close();
            } else if (data.status === "error") {
                setVideoGenerateState("Error in generating video")
                console.error("Job failed:", data.message);
                socket.close();
            }
        }

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
            socket.close();
        };

        socket.onclose = async (event) => {
            if (event.code === 1008 || event.code === 4001) {
                console.warn("Access token expired, refreshing...");
                await connectWebSocket(job_id, tempId);
            }
            setVideoGenerateState('');
            console.log('WebSocket closed');
        };
    }

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [chatMessages, videoLoading]);

    return (
        <>
            <SidebarProvider>
                <div className="h-screen flex w-full relative bg-neutral-950">
                    <ChatSidebar />

                    <div className="flex-1 flex flex-col items-center h-screen relative">
                        <Navbar position="absolute" />

                        {loading ? (
                            <div className='w-full h-[90vh] px-4 pt-20 pb-40 flex items-center justify-center'>
                                <Loader />
                            </div>
                        ) : (
                            <div className="w-full h-[90vh] overflow-y-auto px-4 pt-20 pb-40" ref={scrollAreaRef}>
                                <div className="max-w-3xl mx-auto">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className="space-y-12">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, ease: easeInOut }}
                                                className="flex justify-end mt-5">
                                                <div className="bg-neutral-700 text-white px-5 py-3 rounded-xl max-w-md font-noto font-light text-base">
                                                    {msg.userMessage}
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5, ease: easeInOut }}
                                                className="flex justify-start">
                                                <div className="rounded-xl overflow-hidden w-md">
                                                    {msg.videoUrl ? (
                                                        <motion.video
                                                            muted
                                                            controls
                                                            preload="none"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.5, ease: easeInOut }}
                                                            className="rounded-lg w-full">
                                                            <source src={msg.videoUrl} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </motion.video>)
                                                        : (
                                                            !videoLoading && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.5, ease: easeInOut }}
                                                                    className="bg-neutral-700 w-full h-64 flex items-center justify-center rounded-xl">
                                                                    <div className="text-center text-white">
                                                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
                                                                        <p className="text-sm opacity-80 font-noto">
                                                                            {videoGenerateState || "Generating video..."}
                                                                        </p>
                                                                    </div>
                                                                </motion.div>
                                                            )
                                                        )}
                                                </div>
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chat Input - fixed at bottom center */}
                        <div className="w-full px-4 py-4 absolute bottom-0 left-0">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7, ease: easeIn }}
                                className="max-w-3xl mx-auto bg-[#313131] rounded-3xl shadow-md w-full relative"
                            >
                                <textarea
                                    placeholder='Ask a follow-up'
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full text-base pl-6 py-4 pr-14 resize-none border-none outline-none bg-transparent font-noto text-gray-100 placeholder:text-gray-300 placeholder:font-medium placeholder:text-base"
                                />
                                <div className='relative w-full h-11 px-4 flex justify-between'>
                                    <div className="flex items-center">
                                        <Label htmlFor="newMessage" className="text-xs text-gray-300 font-normal font-noto">
                                            Note : Want to create fresh scene or video please proceed with new chat
                                        </Label>
                                    </div>
                                    <Button
                                        onClick={handleChatBtn}
                                        disabled={prompt == "" || videoLoading}
                                        size={'icon'}
                                        className="bg-white flex items-center justify-center hover:bg-slate-100 cursor-pointer rounded-full"
                                    >
                                        <MoveUp className='text-black size-4' />
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </SidebarProvider>
        </>
    )
}

export default ChatPage;