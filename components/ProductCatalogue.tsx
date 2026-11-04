'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
type Product={id:string;name:string;slug:string;brand:string;category:string;short_description:string;image_url:string;featured:boolean};
export default function ProductCatalogue(){
 const [items,setItems]=useState<Product[]>([]);const [loading,setLoading]=useState(true);
 useEffect(()=>{if(!isSupabaseConfigured||!supabase){setLoading(false);return;}supabase.from('products').select('id,name,slug,brand,category,short_description,image_url,featured').eq('status','published').order('featured',{ascending:false}).order('created_at',{ascending:false}).then(({data})=>{setItems((data||[]) as Product[]);setLoading(false);});},[]);
 return <div className="shell products-page"><div className="eyebrow">THE HIGHBROW CATALOGUE</div><h1>Products worth <em>knowing.</em></h1><p className="products-intro">A growing collection of useful tech, selected and explained with the buyer in mind.</p>{loading?<p>Loading products…</p>:items.length===0?<div className="products-empty"><h2>Our product catalogue is taking shape.</h2><p>We’re preparing researched listings and practical recommendations. Check back soon.</p></div>:<div className="products-grid">{items.map(p=><article className="product-card" key={p.id}><Link href={`/products/${p.slug}`} className="product-thumb">{p.image_url?<img src={p.image_url} alt={p.name}/>:<span>HIGHBROW PICK</span>}{p.featured&&<b>FEATURED</b>}</Link><div className="product-meta">{p.category} <span>{p.brand}</span></div><h2><Link href={`/products/${p.slug}`}>{p.name}</Link></h2><p>{p.short_description}</p><Link className="product-read" href={`/products/${p.slug}`}>Product details <ArrowUpRight size={15}/></Link></article>)}</div>}{!isSupabaseConfigured&&<p className="products-setup-note">Product listings will appear here after Supabase is connected. See the admin setup guide.</p>}</div>;
}
