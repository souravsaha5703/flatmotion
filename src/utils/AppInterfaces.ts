export interface DialogProps {
    isDialogOpen: boolean;
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface Error {
    title: string;
    description: string;
}

export interface ErrorDialogProps extends DialogProps{
    error: Error | null;
}

export interface Message {
    id: string;
    userMessage: string;
    videoScript: string;
    videoUrl: string
}

export interface Chat {
    id: string;
    chatName: string;
    messages: Message[];
    user_id: string;
}

export interface GuestData {
    id:string;
    guest_uid:string;
    credits:number;
    is_guest:boolean
}