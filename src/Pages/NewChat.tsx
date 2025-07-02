import { useState, useRef, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/chatSidebar';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { MoveUp } from 'lucide-react';
import { easeIn, motion } from 'motion/react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const NewChat = () => {
    const [lastPrompt, setLastPrompt] = useState<string>('');
    const [videoLoading, setVideoLoading] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>("");
    const { session } = useAuth();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handlePromptSend = async () => {
        if (prompt.trim() !== '') {
            setLastPrompt(prompt);
            setPrompt('');
            const customizedPrompt: string = prompt + " using manim animation";
            if (session?.access_token) {
                const access_token = session.access_token;
                setVideoLoading(true);
                try {
                    const response = await axios.post(
                        `${import.meta.env.VITE_SERVER_URL}/generate`,
                        { prompt: customizedPrompt },
                        {
                            headers: {
                                Authorization: `Bearer ${access_token}`,
                                "x-refresh-token": session.refresh_token,
                                'Content-Type': 'application/json',
                            },
                            withCredentials: true
                        },
                    );
                    navigate(`/chat/${response.data.data[0].id}`);
                } catch (error) {
                    console.error(error);
                }
                finally {
                    setVideoLoading(true);
                }
            }
        }
    }

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [videoLoading]);

    return (
        <>
            <SidebarProvider>
                <div className="h-screen flex w-full relative bg-neutral-800">
                    <ChatSidebar />

                    <div className="flex-1 flex flex-col items-center h-screen relative">
                        <Navbar position="absolute" />

                        <div className="w-full h-[90vh] overflow-y-auto px-4 pt-20 pb-40" ref={scrollAreaRef}>
                            {videoLoading && (
                                <div className="space-y-5 mt-5 max-w-3xl mx-auto">
                                    <div className="flex justify-end">
                                        <div className="bg-neutral-700 text-white px-5 py-3 rounded-xl max-w-md font-noto font-light text-base">
                                            {lastPrompt || "Generating video..."}
                                        </div>
                                    </div>

                                    <div className="flex justify-start">
                                        <div className="rounded-xl w-md">
                                            <div className="bg-neutral-700 w-full h-64 flex items-center justify-center rounded-xl">
                                                <div className="text-center text-white">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
                                                    <p className="text-sm opacity-80 font-noto">Generating video...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {lastPrompt === '' && !videoLoading && (
                                <div className="text-center text-gray-200 mt-20">
                                    <h3 className="text-6xl font-semibold mb-4 font-noto">Start a conversation</h3>
                                    <p className="font-noto text-xl font-normal">Send a prompt to generate your first 2D animated video</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full px-4 py-4 absolute bottom-0 left-0">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7, ease: easeIn }}
                                className="max-w-3xl mx-auto bg-[#313131] rounded-3xl shadow-md w-full relative"
                            >
                                <textarea
                                    placeholder='Ask to create a animated video'
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full text-base pl-6 py-4 pr-14 resize-none border-none outline-none bg-transparent font-noto text-gray-100 placeholder:text-gray-300 placeholder:font-medium placeholder:text-base"
                                />
                                <div className='relative w-full h-11 px-4 flex justify-end'>
                                    <Button
                                        onClick={handlePromptSend}
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

export default NewChat;