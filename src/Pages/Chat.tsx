import { useState, useRef, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/chatSidebar';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { MoveUp } from 'lucide-react';
import { easeIn, motion } from 'motion/react';
import type { Message } from '@/utils/AppInterfaces';
import { useAppSelector, useAppDispatch } from '@/hooks/redux-hooks';
import { useParams } from 'react-router-dom';
import Loader from '@/components/loader';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { addChat } from '@/features/chat/chatSlice';

const ChatPage = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState<string>("");
    const [sentNewMessage, setSentNewMessage] = useState<boolean>(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const allChats = useAppSelector((state) => state.chat.allChats);
    const { session } = useAuth();

    useEffect(() => {
        if (allChats) {
            const filteredChats = allChats.filter(chat => chat.id === id);
            filteredChats.map(message => setChatMessages(message.messages));
        }
    }, [id]);

    setTimeout(() => {
        setLoading(false);
    }, 1000);

    const handleChatBtn = async () => {
        if (sentNewMessage) {
            if (prompt.trim() !== '') {
                if (session?.access_token) {
                    const access_token = session.access_token;
                    try {
                        const response = await axios.put(
                            import.meta.env.VITE_SERVER_GENERATE_NEW_VIDEO_URL,
                            { prompt: prompt, id: id },
                            {
                                headers: {
                                    Authorization: `Bearer ${access_token}`,
                                    "x-refresh-token": session.refresh_token,
                                    'Content-Type': 'application/json',
                                },
                                withCredentials: true
                            },
                        );
                        dispatch(addChat(response.data.data[0]));
                        console.log(response.data);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        } else {
            if (prompt.trim() !== '') {
                if (session?.access_token) {
                    const access_token = session.access_token;
                    try {
                        const response = await axios.put(
                            import.meta.env.VITE_SERVER_MODIFICATION_VIDEO_URL,
                            { prompt: prompt, id: id },
                            {
                                headers: {
                                    Authorization: `Bearer ${access_token}`,
                                    "x-refresh-token": session.refresh_token,
                                    'Content-Type': 'application/json',
                                },
                                withCredentials: true
                            },
                        );
                        dispatch(addChat(response.data.data[0]));
                        console.log(response.data);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    }

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, []);

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
                                    {/* Map your messages here if needed */}
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className="space-y-5">
                                            {/* User Message - Right Aligned */}
                                            <div className="flex justify-end mt-5">
                                                <div className="bg-gray-600 text-white px-4 py-3 rounded-lg max-w-md font-noto font-normal text-base">
                                                    {msg.userMessage}
                                                </div>
                                            </div>

                                            {/* AI Response - Left Aligned */}
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
                                    className="w-full text-lg pl-6 py-4 pr-14 resize-none border-none outline-none bg-transparent font-noto text-gray-100 placeholder:text-gray-300 placeholder:font-medium placeholder:text-base"
                                />
                                <div className='relative w-full h-11 px-4 flex justify-between'>
                                    <div className="flex items-center gap-2 px-6 pb-3">
                                        <Checkbox
                                            id="newMessage"
                                            checked={sentNewMessage}
                                            onCheckedChange={(val) => setSentNewMessage(!!val)}
                                        />
                                        <Label htmlFor="newMessage" className="text-sm text-gray-300 font-medium font-noto">
                                            Want to create new scene ?
                                        </Label>
                                    </div>
                                    <Button
                                        onClick={handleChatBtn}
                                        disabled={prompt == ""}
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