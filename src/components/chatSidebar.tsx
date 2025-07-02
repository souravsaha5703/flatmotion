import React from 'react';
import { SquarePen, MessageCircle } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { useNavigate } from 'react-router-dom';

const ChatSidebar: React.FC = () => {
    const { state } = useSidebar();
    const navigate = useNavigate();
    const isCollapsed = state === "collapsed";

    const handleNewChat = () => {
        navigate('/chat');
    }

    const handleChatHistory = () => {
        navigate('/history');
    }

    return (
        <Sidebar
            className={`border-r border-gray-300 dark:border-gray-600 shadow-lg transition-all duration-200`}
            collapsible="icon"
        >
            <div className="p-2 border-b dark:border-gray-600 border-black flex">
                <SidebarTrigger className="dark:text-gray-400 dark:hover:text-white text-gray-800 w-full h-8 flex items-center justify-center cursor-pointer" />
            </div>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleNewChat}
                                    tooltip={isCollapsed ? "New Chat" : undefined}
                                    className="dark:hover:bg-[#262626] hover:bg-black text-black hover:text-gray-100 dark:text-gray-100 dark:hover:text-white transition-colors w-full flex items-center justify-start cursor-pointer"
                                >
                                    <SquarePen className="w-4" />
                                    {!isCollapsed && <span className="ml-1 font-noto font-medium">New Chat</span>}
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={handleChatHistory}
                                    tooltip={isCollapsed ? "Chat History" : undefined}
                                    className="dark:hover:bg-[#262626] hover:bg-black text-black hover:text-gray-100 dark:text-gray-100 dark:hover:text-white transition-colors w-full flex items-center justify-start cursor-pointer"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    {!isCollapsed && <span className="ml-1 font-noto font-medium">Chat History</span>}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

export default ChatSidebar;