import React, { useState, useEffect } from 'react';
import { easeIn, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './mode-toggle';
import { User, CreditCard } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loader from './loader';
import { deleteUser } from "firebase/auth";
import { auth } from '@/firebase/firebaseConfig';
import { useAppSelector } from '@/hooks/redux-hooks';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface NavbarProps {
    position?: string;
    page?: string;
}

const GuestNavbar: React.FC<NavbarProps> = ({ position = "fixed", page = "chat" }) => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const guest = useAppSelector((state) => state.guest.guest);
    const navigate = useNavigate();

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

    const deleteUserBtn = async () => {
        const user = auth.currentUser;

        if (user && user.isAnonymous && user.uid == guest?.guest_uid) {
            setLoading(true);
            if (guest.id) {
                try {
                    await axios.delete(
                        `${import.meta.env.VITE_SERVER_URL}/delete_guest/${guest.id}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            withCredentials: true
                        },
                    )
                    await deleteUser(user);
                    setLoading(false);
                    navigate("/");
                } catch (error) {
                    console.error("Error deleting anonymous user:", error);
                    setLoading(false);
                }
            }
        } else {
            console.log("No matching anonymous user found or already signed out.");
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className='size-9 rounded-full cursor-pointer flex items-center justify-center bg-white'>
                                    <User className='text-black' />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className='bg-neutral-950'>
                                <div className='flex gap-2 font-noto text-white text-sm items-center justify-start px-4 py-2'>
                                    <User className='w-5' />
                                    Guest User
                                </div>
                                <div className='flex gap-2 font-noto text-white text-sm items-center justify-start px-4 py-2'>
                                    <CreditCard className='w-5' />
                                    Credits left : {guest?.credits}
                                </div>
                                <DropdownMenuSeparator />
                                <div className='px-4'>
                                    <Button onClick={deleteUserBtn} disabled={loading} className='font-noto w-full text-white bg-red-500 hover:bg-red-600 cursor-pointer my-2 font-normal text-base'>
                                        {loading ? (
                                            <Loader color='border-t-white' />
                                        ) : (
                                            "Logout"
                                        )}
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </motion.header>
        </>
    )
}

export default GuestNavbar;