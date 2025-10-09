"use client"

import ChatSidebar from '@/components/ChatSidebar';
import Loading from '@/components/Loading';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import { chat_service, useAppData, User } from '@/context/AppContext'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatHeader from '@/components/ChatHeader';
import ChatMessages from '@/components/ChatMessages';
import MessageInput from '@/components/MessageInput';
import { SocketData } from '@/context/SocketContext';

export interface Message{
  _id: string,
  chatId: string;
  sender: string;
  text?: string;
  image?: {
      url: string;
      publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatApp = () => {
  const {loading, isAuth, logoutUser, chats, user: loggedinUser, users, fetchChats, setChats} = useAppData();

  const {onlineUsers, socket} = SocketData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [messages, setMessages] = useState<Message[] | null>(null);

  const [user, setUser] = useState<User | null>(null);

  const [showAllUser, setShowAllUser] = useState(false);

  const [isTyping, setIsTyping] = useState(false);

  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);



  const router = useRouter();
  useEffect(() => {
    if(!loading && !isAuth){
      router.push("/login");
    }
  }, [loading, isAuth, router])

  const handleLogout = () => logoutUser();

  async function fetchChat() {

    const token = Cookies.get("amica-token");
    try {

      const {data} = await axios.get(`${chat_service}/api/v1/message/${selectedUser}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();
      
    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");
    }
    
  }

  const moveChatToTop = (chatId: string, newMessage: any, updatedUnseenCount=true)=>{

    console.log("HELLO 2", chatId, newMessage, updatedUnseenCount);

    setChats((prev) => {
      if(!prev) return null;

      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex((chat) => {
        return chat.chat._id === chatId
      })

      if(chatIndex !== -1){
        const [moveChat] = updatedChats.splice(chatIndex, 1);

        const updatedChat = {
          ...moveChat,
          chat: {
            ...moveChat.chat,
            latestMessage: {
              text: newMessage.text,
              sender: newMessage.sender
            },
            updatedAt: new Date().toString(),
            // unseenCount: updatedUnseenCount && newMessage.sender !== loggedinUser?._id ? (moveChat.chat.unseenCount || 0) + 1 : moveChat.chat.unseenCount || 0
            unseenCount:
              updatedUnseenCount && newMessage.sender !== loggedinUser?._id
                ? (moveChat.chat.unseenCount || 0) + 1
                : moveChat.chat.unseenCount || 0,
          }
        }

        updatedChats.unshift(updatedChat)
      }

      return updatedChats;
    })
  }

  const resetUnseenCount = (chatId: string)=>{
    setChats((prev)=>{
      if(!prev) return null;

      return prev.map((chat)=>{
        if(chat.chat._id === chatId){
          return{
            ...chat,
            chat: {
              ...chat.chat,
              unseenCount: 0
            }
          }
        }
        return chat;
      })
    })
  }


  async function createChat(u: User){
    try {
      const token = Cookies.get("amica-token");
      const {data} = await axios.post(`${chat_service}/api/v1/chat/new`, {
        userId: loggedinUser?._id,
        otherUserId: u._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSelectedUser(data.chatId);
      setShowAllUser(false);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error("Failed to start chat");
    }
  }

  const handleMessageSend = async(e: any, imageFile?:File | null)=>{
    e.preventDefault();

    if(!message.trim() && !imageFile) return;

    if(!selectedUser) return;

    // socket work

    if(typingTimeOut){
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null);
    }


    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedinUser?._id
    })


    const token = Cookies.get("amica-token");

    try {
      const formData = new FormData();

      formData.append("chatId", selectedUser);

      if(message.trim()){
        formData.append("text", message);
      }

      if(imageFile){
        formData.append("image", imageFile);
      }

      const {data} = await axios.post(
        `${chat_service}/api/v1/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some(
          (msg)=> msg._id === data.message._id
        );

        if(!messageExists){
          return [...currentMessages, data.message];
        }

        return currentMessages;
      });

      setMessage("");

      const displayText = imageFile ? "📷 image" : message

      moveChatToTop(
        selectedUser!,
        {
          text: displayText,
          sender: data.sender
        },
        false
      )

    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  const handleTyping = (value: string)=>{
    setMessage(value);

    if(!selectedUser || !socket) return;

    // socket setup

    if(value.trim()){
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedinUser?._id
      })
    }

    if(typingTimeOut){
      clearTimeout(typingTimeOut);
    }

    const timeout = setTimeout(()=>{
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedinUser?._id
      })
    }, 2000)

    setTypingTimeOut(timeout);

  }

  useEffect(()=>{

    socket?.on("newMessage", (message)=>{
      console.log("recieved new message:", message);

      if(selectedUser === message.chatId){
        setMessages((prev)=>{
          const currentMessages = prev || [];
          const messageExists = currentMessages.some(
            (msg)=>msg._id === message._id
          )

          if(!messageExists){
            return [...currentMessages, message]
          }

          return currentMessages;
        });
        console.log("hello 3")
        moveChatToTop(message.chatId, message, false);
      }else{
        console.log("HELLO 1");
        moveChatToTop(message.chatId, message, true);
      }
    })

    socket?.on("messagesSeen", (data)=>{
      console.log("message seen by:", data);

      if(selectedUser === data.chatId){
        setMessages((prev)=>{
          if(!prev) return null;
          return prev.map((msg)=>{
            if(msg.sender === loggedinUser?._id && data.messageIds && data.messageIds.includes(msg._id)){
              return {
                ...msg,
                seen: true,
                seenAt: new Date()
              }
            }else if(msg.sender === loggedinUser?._id && !data.messageIds){
              return {
                ...msg,
                seen: true,
                seenAt: new Date()
              }
            }

            return msg;
          })
        })
      }
    })

    socket?.on("userTyping", (data)=>{
      console.log("recieved user typing, ", data);
      if(data.chatId === selectedUser && data.userId !== loggedinUser?._id){
        setIsTyping(true);
      }
    })

    socket?.on("userStoppedTyping", (data)=>{
      console.log("recieved user stopped typing, ", data);
      if(data.chatId === selectedUser && data.userId !== loggedinUser?._id){
        setIsTyping(false);
      }
    })

    return ()=>{
      socket?.off("newMessage");
      socket?.off("messagesSeen");
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    }

  }, [socket, selectedUser, setChats, loggedinUser?._id])

  useEffect(()=>{
    if(selectedUser){
      fetchChat();
      setIsTyping(false);

      resetUnseenCount(selectedUser);

      socket?.emit("joinChat", selectedUser);

      return ()=>{
        socket?.emit("leaveChat", selectedUser);
        setMessages(null);
      }
    }
  }, [selectedUser, socket]);

  useEffect(()=>{
    return () => {
      if(typingTimeOut){
        clearTimeout(typingTimeOut);
      }
    }
  }, [typingTimeOut])

  if(loading) return <Loading />
  return (
    <div className=' min-h-screen flex bg-[#0B1D51] text-white relative overflow-hidden'>
      <FlickeringGrid
          className="absolute inset-0 z-0 size-full w-screen h-screen"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
          // height={2500}
          // width={2500}
        />
        <ChatSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showAllUsers={showAllUser} setShowAllUsers={setShowAllUser} users={users} loggedInUser={loggedinUser} chats={chats} selectedUser={selectedUser} setSelectedUser={setSelectedUser} handleLogout={handleLogout} createChat={createChat} onlineUsers={onlineUsers} />

        <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10">
        <ChatHeader user={user} setSidebarOpen={setSidebarOpen} isTyping={isTyping} onlineUsers={onlineUsers} />
        <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedinUser} />
        <MessageInput selectedUser={selectedUser} message={message} setMessage={handleTyping} handleMessageSend={handleMessageSend} />
        </div>
    </div>
  )
}

export default ChatApp