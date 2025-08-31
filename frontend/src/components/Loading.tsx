import React from 'react'
import { FlickeringGrid } from './magicui/flickering-grid'

const Loading = () => {
  return (

<div className='relative min-h-screen flex items-center justify-center p-4 max-h-screen overflow-hidden bg-[#0B1D51]'>
        {/* <FlickeringGrid
            className="absolute inset-0 z-0 size-full w-screen h-screen"
            squareSize={4}
            gridGap={6}
            color="#6B7280"
            maxOpacity={0.5}
            flickerChance={0.1}
            // height={2500}
            // width={2500}
          /> */}
<div
  className="p-3 animate-spin drop-shadow-2xl bg-gradient-to-bl from-pink-400 via-purple-400 to-indigo-600 md:w-48 md:h-48 h-32 w-32 aspect-square rounded-full"
>
  <div
    className="rounded-full h-full w-full bg-[#0B1D51] background-blur-md"
  ></div>
</div>
</div>
  )
}

export default Loading