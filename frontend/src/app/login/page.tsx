"use client"

import React, { useState } from 'react'
import { Meteors } from "@/components/magicui/meteors";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShineBorder } from "@/components/magicui/shine-border";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { WarpBackground } from "@/components/magicui/warp-background";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { Pinyon_Script, Fascinate_Inline, Bangers } from "next/font/google";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import axios from 'axios';

const pinyon = Pinyon_Script({
  weight: "400", // available weight(s)
  subsets: ["latin"], 
});

const fascinate = Fascinate_Inline({
  weight: "400",       // Fascinate Inline only has one weight
  subsets: ["latin"], 
});


const login = () => {

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async(e: React.FormEvent):Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const {data} = await axios.post(`http://localhost:5000/api/v1/login`, {
        email
      })

      alert(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error:any) {
      alert(error.response.data.message)
    }finally{
      setLoading(false);
    }
  }

  return (
    // <WarpBackground>
    // <div className=' min-h-screen flex items-center justify-center p-4 max-h-screen overflow-hidden'>
    <div className="relative min-h-screen max-h-screen w-screen overflow-hidden flex items-center justify-center p-4">

        {/* <Meteors number={100} /> */}


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
    
    <Card className="relative overflow-hidden max-w-[550px] w-full z-50">
      <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
      <h1 className={`${fascinate.className} text-center font-bold font-sans text-4xl bg-gradient-to-r from-[#FF3F33] to-[#FF3F33] inline-block text-transparent bg-clip-text `}>... YAPP ...</h1>
      <CardHeader>
        <CardTitle className='text-center text-2xl'>Log In</CardTitle>
        <CardDescription className='text-center text-xl'>
          Enter your email to Yapp on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className='block text-lg font-medium text-gray-800 mb-2'>Email Address</Label>
              <Input id="email" type="email" placeholder="name@example.com" className=' p-4 bg-gray-100 rounded-lg border-gray-700 border-2' required value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            {/* <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div> */}
          </div>
          <Button className="w-full flex items-center justify-center gap-2 my-7 hover:opacity-90 disabled:opacity-50 cursor-pointer" type='submit' disabled={loading}>
            {loading ? <div  className='w-full flex items-center justify-center gap-2'>
              <Loader2 className="w-6 h-6" />
              <span>Sending OTP to your mail...</span>
            </div> : 
            <div className='w-full flex items-center justify-center gap-2'>
              <span>Send verification code</span>
              <ArrowRight className="w-6 h-6" />  
            </div>}

          </Button>
        </form>
      </CardContent>
      {/* <CardFooter>
        <Button className="w-full">Sign In</Button>
      </CardFooter> */}
    </Card>
    

    {/* <RetroGrid /> */}
    </div>
    // </WarpBackground>
  )
}

export default login