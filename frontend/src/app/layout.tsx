import type { Metadata } from "next";
import "./globals.css";
import { Pinyon_Script, Bangers, DynaPuff, Oxanium } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { SocketProvider } from "@/context/SocketContext";

const pinyon = Pinyon_Script({
  weight: "400", // available weight(s)
  subsets: ["latin"], 
});

const bangers = Bangers({
  weight: "400", // available weight(s)
  subsets: ["latin"], 
})

const dynapuff = DynaPuff({
  weight: "400", // available weight(s)
  subsets: ["latin"], 
})

const oxanium = Oxanium({
  weight: "500", // available weight(s)
  subsets: ["latin"], 
})

export const metadata: Metadata = {
  title: "Amica",
  description: "Chat whenever you want, with whoever you want.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
      className={
        `
        ${oxanium.className}
      tracking-wide`}
      >
        <AppProvider>
          <SocketProvider>
            {children}
        </SocketProvider>
        </AppProvider>
      </body>
    </html>
  );
}
