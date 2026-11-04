import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export const metadata: Metadata = { title:{default:'Highbrow Shop | Smarter tech buying decisions',template:'%s | Highbrow Shop'}, description:'Independent technology reviews, practical buying guides and clear product comparisons for smarter tech purchases.', metadataBase:new URL('https://shop.highbrowdirector.in'), openGraph:{type:'website',siteName:'Highbrow Shop',title:'Highbrow Shop',description:'Thoughtful tech advice for better buying decisions.'}, robots:{index:true,follow:true} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/><main>{children}</main><Footer/></body></html>}
