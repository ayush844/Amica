"use client"
import React, { useEffect, useRef, useState } from 'react'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pinyon_Script, Fascinate_Inline, Bangers, Orbitron } from "next/font/google";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShineBorder } from "@/components/magicui/shine-border";
import { BorderBeam } from "@/components/magicui/border-beam";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';



const fascinate = Fascinate_Inline({
  weight: "400",       // Fascinate Inline only has one weight
  subsets: ["latin"], 
});

const orbitron = Orbitron({
  weight: "800",       // Fascinate Inline only has one weight
  subsets: ["latin"], 
});


const VerifyOtp = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string>("");
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState(60);
    const inputRef = useRef<Array<HTMLInputElement | null>>([]);
    const router = useRouter();

    const searchParams = useSearchParams();
    const email:string = searchParams.get('email') || '';

    useEffect(()=>{
        if(timer>0){
            const interval = setInterval(()=>{
                setTimer((prev)=>prev-1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timer]);


    const handleInputChange = (index:number, value:string): void => {
        if(value.length>1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        if(value && index<5){
            inputRef.current[index+1]?.focus();
        }
        
    }


    const handleKeyDown=(index:number, e:React.KeyboardEvent<HTMLElement>):void=>{
        if(e.key==="Backspace" && !otp[index] && index>0){
            inputRef.current[index-1]?.focus();
        }
    }

    const handlePaste=(e:React.ClipboardEvent<HTMLInputElement>):void=>{
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        const digits = pastedData.replace(/\D/g, "").slice(0, 6);
        if(digits.length===6){
            const newOtp = digits.split("");
            setOtp(newOtp);
            inputRef.current[5]?.focus();
        }
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>):Promise<void> => {
      e.preventDefault();

      const otpString = otp.join("");

      if(otpString.length<6){
          setError("Please enter a valid 6 digit code");
          return;
      }

      setError("");
      setLoading(true);

      try {
        const {data} = await axios.post("http://localhost:5000/api/v1/verify", {
          email,
          otp: otpString
        })
        alert(data.message);
        Cookies.set("token", data.token, {
          expires: 15,
          secure: false,
          path: '/'
        });
        setOtp(["", "", "", "", "", ""]);
        inputRef.current[0]?.focus();
      } catch (error: any) {
        setError(error?.response?.data?.message)
      } finally{
        setLoading(false);
      }

    }

    const handleResendOtp = async() => {
      setResendLoading(true);
      setError("");
      try {
        const {data} = await axios.post(`http://localhost:5000/api/v1/login`, {
          email
        });
        alert(data.message);
        setTimer(60);
      } catch (error: any) {
        setError(error?.response?.data?.message)
      } finally{
        setResendLoading(false)
      }
    }

  return (
        <div className="relative min-h-screen max-h-screen w-screen overflow-hidden flex items-center justify-center p-4 bg-[#0B1D51]">

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

      <button className='absolute top-0 left-0 p-2 texxt-gray-300 hover:text-white'>
        <ChevronLeft className='w-6 h-6' onClick={()=>router.push("/login")} />
      </button>

      <h1 className={`${orbitron.className} text-center font-bold font-sans text-5xl bg-gradient-to-r from-[#FF3F33] to-[#FF3F33] inline-block text-transparent bg-clip-text `}>Amica</h1>
      <CardHeader>
        <CardTitle className='text-center text-2xl'>Verify Your Email Address</CardTitle>
        <CardDescription className='text-center text-xl'>
          We have sent a 6 digit code to
        </CardDescription>
        <p className=' text-[#640D5F] font-medium text-center'>{email}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
            {/* <div className="grid gap-2 "> */}
            <div className="flex flex-col items-center">
              <Label className='block text-lg font-medium text-gray-800 mb-4 text-center'>Enter your 6 digits OTP here:</Label>

              <div className='flex justify-center in-checked: space-x-1 sm:space-x-3'>
                {
                  otp.map((digit, index)=>(
                    <input
                      key={index}
                      ref={(el: HTMLInputElement | null)=>{
                        inputRef.current[index] = el
                      }} 
                      type='text'
                      maxLength={1}
                      value={digit}
                      onChange={(e)=>handleInputChange(index, e.target.value)}
                      onKeyDown={(e)=>handleKeyDown(index, e)}
                      onPaste={index===0 ? handlePaste:undefined}
                      className='w-12 h-12 text-center text-xl font-bold border-2 border-gray-400 rounded-lg bg-[#000957] text-white'
                    />
                  ))
                }
              </div>
            </div>

              {/* <Input id="email" type="email" placeholder="name@example.com" className=' p-4 bg-gray-100 rounded-lg border-gray-700 border-2' required  /> */}
            {/* </div> */}

          {
            error && <div className="bg-red-900 border borderred-700 rounded-lg mt-3 p-3">
              <p className='text-red-300 text-sm text-center'>{error}</p>
            </div>
          }


          <Button className="w-full flex items-center justify-center gap-2 my-7 hover:opacity-90 disabled:opacity-50 cursor-pointer" type='submit' disabled={loading}>
            {loading ? <div  className='w-full flex items-center justify-center gap-2'>
              <Loader2 className="w-6 h-6" />
              <span>Verifying...</span>
            </div> : 
            <div className='w-full flex items-center justify-center gap-2'>
              <span>Verify</span>
              <ArrowRight className="w-6 h-6" />  
            </div>}

          </Button>


        </form>


      <div className=' mt-6 text-center'>
        <p className='text-gray-500 text-sm mb-4'>Didn't receive the code?</p>
        {
          timer>0 ? <p className=' text-gray-500 text-sm'>Resend code in {timer} seconds</p> : <button type='button' onClick={handleResendOtp} className=' text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50' disabled={resendLoading}>{resendLoading?"Sending...":"Resend Code"}</button>
        }
      </div>

      </CardContent>
      {/* <CardFooter>
        <Button className="w-full">Sign In</Button>
      </CardFooter> */}

      <BorderBeam
        duration={6}
        size={800}
        className="from-transparent via-red-500 to-transparent"
      />
      <BorderBeam
        duration={6}
        delay={3}
        size={800}
        borderWidth={4}
        className="from-transparent via-blue-500 to-transparent"
      />
    </Card>
    

    {/* <RetroGrid /> */}
    </div>
  )
}

export default VerifyOtp