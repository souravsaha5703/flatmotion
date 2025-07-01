import { useState, useRef, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/chatSidebar';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { MoveUp } from 'lucide-react';
import { easeIn, motion } from 'motion/react';
import type { Message } from '@/utils/AppInterfaces';
import { useParams } from 'react-router-dom';
import Loader from '@/components/loader';
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const ChatPage = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [lastPrompt, setLastPrompt] = useState<string>('');
    const [videoLoading, setVideoLoading] = useState<boolean>(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState<string>("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { id } = useParams();
    const { session } = useAuth();
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
            console.log("sent")
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
            setLastPrompt(prompt);
            setPrompt('');
            if (session?.access_token) {
                const access_token = session.access_token;
                setVideoLoading(true);
                try {
                    const response = await axios.put(
                        `${import.meta.env.VITE_SERVER_URL}/modify_animation`,
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
                    fetchMessages();
                    // dispatch(addChat(response.data.data[0]));
                    console.log(response.data);
                } catch (error) {
                    console.error(error);
                }
                finally {
                    setVideoLoading(false);
                }
            }
        }
    }

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [chatMessages, videoLoading]);

    return (
        <>
            <SidebarProvider>
                <div className="h-screen flex w-full relative dark:bg-[#262626] bg-gray-50">
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
                                        <div key={msg.id} className="space-y-5">
                                            <div className="flex justify-end mt-5">
                                                <div className="bg-gray-700 text-white px-6 py-3 rounded-2xl max-w-md font-noto font-normal text-base">
                                                    {msg.userMessage}
                                                </div>
                                            </div>

                                            <div className="flex justify-start">
                                                <div className="rounded-xl max-w-md">
                                                    <video controls className="rounded-lg w-full max-w-sm">
                                                        <source src={msg.videoUrl} type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {videoLoading && (
                                    <div className="space-y-5 mt-5 max-w-3xl mx-auto">
                                        {/* Show the last user message that triggered loading */}
                                        <div className="flex justify-end">
                                            <div className="bg-gray-600 text-white px-5 py-3 rounded-2xl max-w-md font-noto font-normal text-base">
                                                {lastPrompt || "Generating video..."}
                                            </div>
                                        </div>

                                        {/* AI Loading Response - Left Aligned */}
                                        <div className="flex justify-start">
                                            <div className="rounded-xl max-w-md">
                                                <div className="bg-gray-600 rounded-lg w-full max-w-md h-48 flex items-center justify-center">
                                                    <div className="text-center text-white">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
                                                        <p className="text-sm opacity-80 font-noto">Generating video...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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