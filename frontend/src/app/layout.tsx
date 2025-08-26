import type { Metadata } from "next";
import "./globals.css";
import { Pinyon_Script, Bangers, DynaPuff } from "next/font/google";

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

export const metadata: Metadata = {
  title: "YAPP",
  description: "Chat whenever you want, with whoever you want.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dynapuff.className} tracking-wide`}
      >
        {children}
      </body>
    </html>
  );
}
