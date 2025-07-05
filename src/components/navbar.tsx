import React, { useState, useEffect } from 'react';
import { easeIn, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './mode-toggle';
import AuthDialog from './Dialogs/AuthDialog';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/supabase/supabaseConfig';
import Loader from './loader';

interface NavbarProps {
    position?: string;
    page?: string;
}

const Navbar: React.FC<NavbarProps> = ({ position = "fixed", page = "chat" }) => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > 20);
        }

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleBtn = () => {
        setIsAuthDialogOpen(true);
    }

    const handleLogout = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut({ scope: 'local' });
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ease: easeIn, duration: 0.4 }}
                className={`${position} left-0 top-0 w-full z-50 ${page == "chat" ? "bg-neutral-950" : "bg-transparent"} ${isScrolled && "bg-black/50 backdrop-blur-md shadow-lg"}`}
            >
                <div className="container mx-auto px-3 py-3 flex justify-between items-center max-[426px]:px-5">
                    <h1 className='font-oswald text-2xl font-semibold text-white'>Flatmotion</h1>
                    <div className='flex gap-4'>
                        <ModeToggle />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className='size-9 rounded-full cursor-pointer flex items-center justify-center bg-white'>
                                        <User className='text-black' />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <div className='flex gap-2 font-noto text-sm items-center justify-center px-4 py-2'>
                                        <Mail className='w-5' />
                                        {user.email}
                                    </div>
                                    <DropdownMenuSeparator />
                                    <div className='px-4'>
                                        <Button onClick={handleLogout} disabled={loading} className='font-noto w-full text-white bg-red-500 hover:bg-red-600 cursor-pointer my-2 font-normal text-base'>
                                            {loading ? (
                                                <Loader color='border-t-white' />
                                            ) : (
                                                "Logout"
                                            )}
                                        </Button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button onClick={handleBtn} className="font-noto cursor-pointer text-base bg-slate-100 text-black hover:bg-slate-200">
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </motion.header>
            <AuthDialog isDialogOpen={isAuthDialogOpen} setIsDialogOpen={setIsAuthDialogOpen} />
        </>
    )
}

export default Navbar;