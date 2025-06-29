import { useEffect, useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatSidebar from '@/components/chatSidebar';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { MoveUp } from 'lucide-react';
import { easeIn, motion } from 'motion/react';
import { useAppSelector } from '@/hooks/redux-hooks';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const Chat = () => {
    const [prompt, setPrompt] = useState<string>("");
    const { session } = useAuth();
    const currentPrompt = useAppSelector((state) => state.prompt.currentPrompt);

    useEffect(() => {
        if (currentPrompt) {
            if (session?.access_token) {
                const access_token = session?.access_token;
                const generateVideo = async () => {
                    try {
                        const response = await axios.post(
                            import.meta.env.VITE_SERVER_GENERATE_VIDEO_URL,
                            { prompt: currentPrompt },
                            {
                                headers: {
                                    Authorization: `Bearer ${access_token}`,
                                    'Content-Type': 'application/json',
                                },
                                withCredentials: true
                            },
                        );
                        console.log(response.data);
                    } catch (error) {
                        console.error(error);
                    }
                }
                generateVideo();
            }
        }
    }, [currentPrompt]);

    return (
        <>
            <SidebarProvider>
                <div className="h-screen flex w-full relative dark:bg-[#262626] bg-gray-50">
                    <ChatSidebar />

                    <div className="flex-1 flex flex-col items-center h-screen relative">
                        <Navbar position="absolute" />

                        {/* Messages container (optional) */}
                        <div className="flex-1 w-full overflow-y-auto px-4 pt-20 pb-40">
                            <div className="max-w-3xl mx-auto">
                                {/* Map your messages here if needed */}
                            </div>
                        </div>

                        {/* Chat Input - fixed at bottom center */}
                        <div className="w-full px-4 py-6 absolute bottom-0 left-0">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.7, ease: easeIn }}
                                className="max-w-3xl mx-auto bg-[#313131] rounded-3xl shadow-md w-full relative"
                            >
                                <textarea
                                    placeholder='E.g., “ Animate a circle rotating ”'
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full text-lg pl-6 py-4 pr-14 resize-none border-none outline-none bg-transparent font-noto text-gray-100 placeholder:text-gray-300 placeholder:font-medium placeholder:text-base"
                                />
                                <div className='relative w-full h-11 px-4 flex justify-end'>
                                    <Button
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

export default Chat;