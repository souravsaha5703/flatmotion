import { useState, useRef, useEffect } from 'react';
import GuestNavbar from '@/components/guestNavbar';
import { Button } from '@/components/ui/button';
import { MoveUp } from 'lucide-react';
import { easeIn, easeInOut, motion } from 'motion/react';
import type { Message } from '@/utils/AppInterfaces';
import Loader from '@/components/loader';
import { Label } from "@/components/ui/label";
import { useAppSelector, useAppDispatch } from '@/hooks/redux-hooks';
import { useNavigate } from 'react-router-dom';
import { addGuest } from '@/features/guest/guestSlice';

const GuestChat = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [videoLoading, setVideoLoading] = useState<boolean>(false);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState<string>("");
    const [videoGenerateState, setVideoGenerateState] = useState<string>('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const guestPrompt = useAppSelector((state) => state.prompt.currentPrompt);
    const guestUser = useAppSelector((state) => state.guest.guest);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (guestUser == null) {
            navigate('/');
        }
    }, [guestUser]);

    useEffect(() => {
        if (guestPrompt) {
            setPrompt(guestPrompt);
        }
    }, [guestPrompt]);

    setTimeout(() => {
        setLoading(false);
    }, 1000);

    const handleChatBtn = async () => {
        if (prompt.trim() !== '') {
            if (guestUser?.id) {
                const tempId = crypto.randomUUID();
                const newMessage: Message = {
                    id: tempId,
                    userMessage: prompt,
                    videoScript: '',
                    videoUrl: '',
                }

                setChatMessages(prev => [...prev, newMessage]);
                setPrompt('');
                setVideoLoading(true);
                const customizedPrompt: string = prompt + " using manim animation";

                try {
                    await connectWebSocket(customizedPrompt, guestUser.id, tempId);
                } catch (error) {
                    console.error(error);
                    setVideoGenerateState("Error in generating video");
                } finally {
                    setVideoLoading(false);
                    setVideoGenerateState('');
                }
            }
        }
    }

    const connectWebSocket = async (prompt: string, guestId: string, tempId: string) => {
        const socket = new WebSocket(`${import.meta.env.VITE_SERVER_WS_URL}/ws/guest/jobs`);

        socket.onopen = () => {
            console.log("Web socket connection opened");
            socket.send(JSON.stringify({
                prompt: prompt,
                guest_id: guestId
            }));
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.status === "started" || data.status === "rendering") {
                setVideoGenerateState(data.message);
            }

            if (data.status === 'completed') {
                setVideoGenerateState(data.message);
                setChatMessages(prev =>
                    prev.map((msg) =>
                        msg.id == tempId ? { ...msg, videoUrl: data.video_url, videoScript: data.script } : msg)
                );
                console.log("okay")
                dispatch(addGuest(data.creditData[0]));
                socket.close();
            }

            if (data?.status == "error") {
                setVideoGenerateState("Error in generating video")
                console.error("Job failed:", data?.message);
                socket.close();
            }
        }

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
            socket.close();
        };

        socket.onclose = () => {
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
            <div className="h-screen flex w-full relative bg-neutral-950">
                <div className="flex-1 flex flex-col items-center h-screen relative">
                    <GuestNavbar position="absolute" />

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
                                            <div className="bg-neutral-700 text-white px-5 py-3 rounded-xl max-w-md font-noto font-light text-base max-[425px]:text-sm">
                                                {msg.userMessage}
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5, ease: easeInOut }}
                                            className="flex justify-start">
                                            <div className="rounded-xl overflow-hidden w-md max-[500px]:w-sm max-[425px]:w-[300px] max-[350px]:w-[280px]">
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

                                {chatMessages.length == 0 && (
                                    <div className="text-center text-gray-200 mt-20">
                                        <h3 className="text-6xl font-semibold mb-4 font-noto">Start a conversation</h3>
                                        <p className="font-noto text-xl font-normal">Send a prompt to generate your first 2D animated video</p>
                                    </div>
                                )}
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
                                placeholder={`${chatMessages.length == 0 ? 'Ask to animate a rectangle' : 'Ask a follow-up'}`}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full text-base pl-6 py-4 pr-14 resize-none border-none outline-none bg-transparent font-noto text-gray-100 placeholder:text-gray-300 placeholder:font-medium placeholder:text-base"
                            />
                            <div className='relative w-full h-11 px-4 flex justify-between'>
                                <div className="flex items-center">
                                    <Label htmlFor="newMessage" className="text-xs text-gray-300 font-normal font-noto">
                                        Note : Create an account to access all features
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
        </>
    )
}

export default GuestChat;