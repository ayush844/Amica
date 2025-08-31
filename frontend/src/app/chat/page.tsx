"use client"

import Loading from '@/components/Loading';
import { useAppData } from '@/context/AppContext'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const ChatApp = () => {
  const {loading, isAuth} = useAppData();
  const router = useRouter();
  useEffect(() => {
    if(!loading && !isAuth){
      router.push("/login");
    }
  }, [loading, isAuth, router])

  if(loading) return <Loading />
  return (
    <div>chat page</div>
  )
}

export default ChatApp