import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import type { DialogProps } from '@/utils/AppInterfaces';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { supabase } from '@/supabase/supabaseConfig';
import { auth } from '@/firebase/firebaseConfig';
import { signInAnonymously } from 'firebase/auth';
import Loader from '../loader';
import axios from 'axios';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { addGuest } from '@/features/guest/guestSlice';
import { useNavigate } from 'react-router-dom';

const AuthDialog: React.FC<DialogProps> = ({ isDialogOpen, setIsDialogOpen }) => {
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [otpError, setOtpError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [otpLoading, setOtpLoading] = useState<boolean>(false);
    const [isOTPDialogOpen, setIsOTPDialogOpen] = useState<boolean>(false);
    const [guestLoading, setGuestLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSendCodeBtn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: true,
                }
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                setError('');
                setLoading(false);
                setIsDialogOpen(false);
                setIsOTPDialogOpen(true);
            }
        } catch (error) {
            setError("Something went wrong");
            setLoading(false);
        }
    }

    const handleOTPSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setOtpLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: email,
                token: otp,
                type: 'email'
            });

            if (error) {
                setOtpError(error.message);
                setOtpLoading(false);
            } else {
                setOtpError('');
                setOtpLoading(false);
                setIsOTPDialogOpen(false);
            }
        } catch (error) {
            setError("Something went wrong");
            setOtpLoading(false);
        }
    }

    const handleGuestTryBtn = async () => {
        try {
            setGuestLoading(true);
            const result = await signInAnonymously(auth);
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/create_guest`,
                { uid: result.user.uid },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                },
            );
            dispatch(addGuest(response.data.guestData[0]));
            setGuestLoading(false);
            setIsDialogOpen(false);
            navigate('/guest_chat');
        } catch (error) {
            console.error(error);
            setGuestLoading(false);
        }
    }

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-center font-oswald text-3xl font-semibold'>
                            Sign In
                        </DialogTitle>
                    </DialogHeader>
                    <div className='w-full flex flex-col space-y-5'>
                        <div className="flex flex-col gap-4 mt-2">
                            <Button variant="outline" className="w-full font-noto font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Sign In with Google
                            </Button>
                        </div>
                        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                            <span className="relative z-10 bg-background px-2 text-muted-foreground font-noto font-normal">
                                Or continue with
                            </span>
                        </div>
                        <form onSubmit={handleSendCodeBtn} className='w-full'>
                            <Input
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Enter Email address'
                                className='px-4 py-2 h-12 mt-4 font-noto text-base placeholder:text-base'
                                required
                            />
                            <Button type='submit' disabled={loading} className='w-full mt-4 font-noto text-base font-medium cursor-pointer' size={'lg'}>
                                {loading ? (
                                    <Loader />
                                ) : (
                                    "Send a code to email"
                                )}
                            </Button>
                            {error && <span className='font-noto mt-2 text-sm text-red-600 font-normal'>{error}</span>}
                        </form>
                        {guestLoading ? (
                            <div className='w-full flex items-center justify-center'>
                                <Loader />
                            </div>
                        ) : (
                            <Button onClick={handleGuestTryBtn} variant={'link'} className='cursor-pointer font-noto text-base text-center text-gray-300 font-light'>Try as a guest</Button>
                        )}

                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isOTPDialogOpen} onOpenChange={setIsOTPDialogOpen}>
                <DialogContent className='max-[425px]:justify-center'>
                    <DialogHeader>
                        <DialogTitle className='text-center font-noto text-3xl max-[520px]:text-2xl font-semibold max-[375px]:text-lg'>
                            OTP Verification
                        </DialogTitle>
                        <DialogDescription className='text-center font-noto text-base font-medium px-2 max-[375px]:text-sm'>
                            We have sent a 6-digit code to {email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-8 max-[520px]:px-4 pb-10 max-[520px]:pb-6 space-y-8 max-[520px]:space-y-6 flex flex-col items-center justify-center">
                        <div className="flex justify-center">
                            <InputOTP
                                value={otp}
                                onChange={setOtp}
                                maxLength={6}
                                className="gap-3 max-[520px]:gap-2"
                            >
                                <InputOTPGroup className="gap-3 max-[520px]:gap-2">
                                    <InputOTPSlot index={0} className="w-14 h-14 max-[520px]:w-10 max-[520px]:h-10 max-[375px]:w-8 max-[375px]:h-8 text-xl max-[520px]:text-lg font-bold rounded-md border border-gray-200 focus:border-orange-400 transition-colors" />
                                    <InputOTPSlot index={1} className="w-14 h-14 max-[520px]:w-10 max-[520px]:h-10 max-[375px]:w-8 max-[375px]:h-8 text-xl max-[520px]:text-lg font-bold rounded-md border border-gray-200 focus:border-orange-400 transition-colors" />
                                    <InputOTPSlot index={2} className="w-14 h-14 max-[520px]:w-10 max-[520px]:h-10 max-[375px]:w-8 max-[375px]:h-8 text-xl max-[520px]:text-lg font-bold rounded-md border border-gray-200 focus:border-orange-400 transition-colors" />
                                    <InputOTPSlot index={3} className="w-14 h-14 max-[520px]:w-10 max-[520px]:h-10 max-[375px]:w-8 max-[375px]:h-8 text-xl max-[520px]:text-lg font-bold rounded-md border border-gray-200 focus:border-orange-400 transition-colors" />
                                    <InputOTPSlot index={4} className="w-14 h-14 max-[520px]:w-10 max-[520px]:h-10 max-[375px]:w-8 max-[375px]:h-8 text-xl max-[520px]:text-lg font-bold rounded-md border border-gray-200 focus:border-orange-400 transition-colors" />
                                    <InputOTPSlot index={5} className="w-14 h-14 max-[520px]:w-10 max-[520px]:h-10 max-[375px]:w-8 max-[375px]:h-8 text-xl max-[520px]:text-lg font-bold rounded-md border border-gray-200 focus:border-orange-400 transition-colors" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            onClick={handleOTPSubmit}
                            disabled={otpLoading}
                            className="w-full h-12 max-[520px]:h-10 font-noto font-semibold text-lg max-[520px]:text-base rounded-md shadow-lg cursor-pointer"
                        >
                            {otpLoading ? (
                                <Loader />
                            ) : "Verify OTP"}
                        </Button>
                        <div className='flex items-center max-[520px]:flex-col max-[520px]:gap-1'>
                            <h3 className='text-gray-500 font-noto font-normal text-sm max-[520px]:text-xs'>Did not received otp ?</h3>
                            <Button variant={'link'} className='text-gray-100 font-noto font-normal text-sm max-[520px]:text-xs cursor-pointer max-[520px]:p-0 max-[520px]:h-auto'>Resend OTP</Button>
                        </div>
                        {otpError && <span className='font-noto text-sm max-[520px]:text-xs text-red-600 font-normal text-center'>{otpError}</span>}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AuthDialog;