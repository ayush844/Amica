"use client"

import React, { createContext, ReactNode, use, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, {Toaster} from 'react-hot-toast';


export const user_service = "http://localhost:5000";
export const chat_service = "http://localhost:5002";


export interface User{
    _id: string;
    name: string;
    email: string;
}


export interface Chat{
    _id: string;
    users: string[];
    latestMessage: {
        text: string;
        sender: string;
    };
    createdAt: string;
    updatedAt: string;
    unseenCount?: number;
}


export interface Chats{
    _id: string;
    user: User;
    chat: Chat;
}


interface AppContextType{
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: () => Promise<void>;
    fetchChats: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    chats: Chats[] | null;
    users: User[] | null;
    setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>
}


const AppContext = createContext<AppContextType | undefined>(undefined);


interface AppProviderProps{
    children: ReactNode;
}


export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    async function fetchUser(){
        try {

            const token = Cookies.get("amica-token");
            if(!token){
                setLoading(false);
                return;
            }
            const {data} = await axios.get(`${user_service}/api/v1/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setUser(data);
            setIsAuth(true);
            setLoading(false);
            
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function logoutUser(){
        Cookies.remove("amica-token");
        setUser(null);
        setIsAuth(false);
        toast.success("User logged out");
    }

    const [chats, setChats] = useState<Chats[] | null>(null);

    async function fetchChats(){
        const token = Cookies.get("amica-token")
        
        try {
            const {data} = await axios.get(`${chat_service}/api/v1/chat/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            setChats(data.chats);
        } catch (error) {
            console.log(error)
        }
    }

    const [users, setUsers] = useState<User[] | null>(null);

    async function fetchUsers(){
        const token = Cookies.get("amica-token")
        
        try {
            const {data} = await axios.get(`${user_service}/api/v1/users/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            setUsers(data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchUser();
        fetchChats();
        fetchUsers();
    }, []);

    return (
    <AppContext.Provider value={{user, setUser, isAuth, setIsAuth, loading, logoutUser, fetchChats, fetchUsers, chats, setChats, users}}>
        {children}
        <Toaster />
    </AppContext.Provider>)
}


export const useAppData = ():AppContextType => {
    const context = useContext(AppContext);
    if(!context){
        throw new Error("useAppData must be used within AppProvider");
    }
    return context;
}