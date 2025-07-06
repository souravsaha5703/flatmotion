import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from "@/components/ui/button";
import { Sparkles, MoveUp } from 'lucide-react';
import AnimatedGradientBackground from '@/components/animated-gradient';
import Navbar from '@/components/navbar';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { addChat } from '@/features/chat/chatSlice';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';
import Loader from '@/components/loader';
import AuthDialog from '@/components/Dialogs/AuthDialog';

const Page: React.FC = () => {
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState<boolean>(false);
    const [prompt, setPrompt] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { session,user } = useAuth();

    const handlePromptSend = async () => {
        if (prompt.trim() !== '') {
            if (user == null) {
                setIsAuthDialogOpen(true);
            } else {
                setIsAuthDialogOpen(false);
                const customizedPrompt: string = prompt + " using manim animation";
                if (session?.access_token) {
                    setLoading(true);
                    const access_token = session.access_token;
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
                        setLoading(false);
                        dispatch(addChat(response.data.data[0]));
                        navigate(`/chat/${response.data.data[0].id}`);
                    } catch (error) {
                        setLoading(false);
                        console.error(error);
                    }
                }
            }
        }
    }

    return (
        <>
            <Navbar page='home' />
            <section className="relative min-h-screen px-5 py-10 flex items-center justify-center overflow-hidden bg-black max-[426px]:px-0">
                <AnimatedGradientBackground />
                <div className="relative z-10 text-center max-w-7xl mx-auto flex items-center justify-center flex-col max-[426px]:px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-6"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/20 text-white text-sm font-normal backdrop-blur-sm font-noto">
                            <Sparkles className="w-4 h-4" />
                            Powered by Manim Library
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-8xl max-[768px]:text-7xl max-[640px]:text-6xl max-[540px]:text-5xl max-[364px]:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 leading-tight font-noto tracking-tight text-center"
                    >
                        Cursor for 2D Animations
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg max-[768px]:text-base max-[640px]:text-sm max-[425px]:text-xs font-noto text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
                    >
                        Transform your ideas into stunning mathematical animations with AI. Just prompt, run and watch your mathematical ideas transform into clear, engaging 2D animations.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-3xl bg-[#262626] rounded-3xl mt-5 max-md:w-full">
                        <textarea
                            placeholder='E.g., “ Animate a circle rotating ”'
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full text-base pl-6 py-4 pr-4 resize-none border-none outline-none focus:outline-none focus:ring-0 bg-transparent font-noto text-gray-100 placeholder:text-gray-300 placeholder:text-base placeholder:font-noto placeholder:font-medium font-normal"
                        />
                        <div className='relative w-full h-12'>
                            <Button
                                disabled={prompt.trim() == '' || loading}
                                onClick={handlePromptSend}
                                className="absolute bottom-4 right-4 bg-white flex items-center justify-center hover:bg-slate-100 cursor-pointer rounded-full"
                            >
                                {loading ? <Loader /> : <MoveUp className='text-black size-4' />}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
            <AuthDialog isDialogOpen={isAuthDialogOpen} setIsDialogOpen={setIsAuthDialogOpen} />
        </>
    )
}

export default Page;