import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog";
import type { ErrorDialogProps } from '@/utils/AppInterfaces';
import { Button } from '../ui/button';

const ErrorDialog: React.FC<ErrorDialogProps> = ({ isDialogOpen, setIsDialogOpen, error }) => {
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-left font-noto font-semibold'>
                        {error?.title}
                    </DialogTitle>
                    <DialogDescription className='text-left font-noto font-medium'>
                        {error?.description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={'outline'}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ErrorDialog;