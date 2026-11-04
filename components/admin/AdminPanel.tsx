'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LogOut, PackagePlus, Pencil, Trash2, ExternalLink, ImagePlus, LayoutDashboard } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type Product = {
  id: string; name: string; slug: string; brand: string; category: string;
  short_description: string; description: string; image_url: string; amazon_url: string;
  price_note: string; specifications: Record<string,string>; pros: string[]; cons: string[];
  featured: boolean; status: 'draft'|'published'; created_at: string;
};
const blank = { name:'', slug:'', brand:'', category:'PC & Gaming', short_description:'', description:'', image_url:'', amazon_url:'', price_note:'', specs:'', pros:'', cons:'', featured:false, status:'draft' as 'draft'|'published' };
const categories = ['PC & Gaming','Monitors & Displays','Keyboards & Mice','Laptops & Accessories','Streaming Equipment','Audio','Smart Home','Storage','Other'];
const slugify = (s:string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

export default function AdminPanel(){
  const [session,setSession] = useState<any>(null);
  const [loading,setLoading] = useState(true);
  const [products,setProducts] = useState<Product[]>([]);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [form,setForm] = useState(blank);
  const [editing,setEditing] = useState<string|null>(null);
  const [saving,setSaving] = useState(false);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [search,setSearch] = useState('');

  useEffect(()=>{
    if(!supabase){setLoading(false);return;}
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false);});
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,next)=>setSession(next));
    return ()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{ if(session) loadProducts(); },[session]);
  async function loadProducts(){
    if(!supabase)return;
    const {data,error} = await supabase.from('products').select('*').order('created_at',{ascending:false});
    if(error)setError(error.message); else setProducts((data||[]) as Product[]);
  }
  const [isAdmin,setIsAdmin] = useState(false);
  const [adminCheckLoading,setAdminCheckLoading] = useState(true);
  useEffect(()=>{
    let active = true;
    async function checkAdmin(){
      if(!supabase || !session?.user?.id){ if(active){setIsAdmin(false);setAdminCheckLoading(false);} return; }
      setAdminCheckLoading(true);
      const {data,error} = await supabase.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
      if(active){setIsAdmin(!error && Boolean(data));setAdminCheckLoading(false);}
    }
    checkAdmin();
    return ()=>{active=false;};
  },[session]);

  const filtered = useMemo(()=>products.filter(p=>`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(search.toLowerCase())),[products,search]);
  async function login(e:FormEvent){e.preventDefault();setError('');if(!supabase)return;const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);}
  async function logout(){await supabase?.auth.signOut();setProducts([]);}
  function edit(p:Product){setEditing(p.id);setForm({name:p.name,slug:p.slug,brand:p.brand,category:p.category,short_description:p.short_description,description:p.description,image_url:p.image_url,amazon_url:p.amazon_url,price_note:p.price_note,specs:Object.entries(p.specifications||{}).map(([k,v])=>`${k}: ${v}`).join('\n'),pros:(p.pros||[]).join('\n'),cons:(p.cons||[]).join('\n'),featured:p.featured,status:p.status});window.scrollTo({top:0,behavior:'smooth'});}
  function reset(){setForm(blank);setEditing(null);setNotice('');}
  async function uploadImage(file?:File){
    if(!file||!supabase)return;
    if(file.size>5*1024*1024){setError('Image must be 5 MB or smaller.');return;}
    const ext=file.name.split('.').pop()||'jpg';const path=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const {error}=await supabase.storage.from('product-images').upload(path,file,{upsert:false,contentType:file.type});
    if(error){setError(error.message);return;}
    const {data}=supabase.storage.from('product-images').getPublicUrl(path);
    setForm(f=>({...f,image_url:data.publicUrl}));setNotice('Image uploaded.');
  }
  async function save(e:FormEvent){
    e.preventDefault();if(!supabase)return;setSaving(true);setError('');setNotice('');
    const specifications:Record<string,string>={};form.specs.split('\n').map(x=>x.trim()).filter(Boolean).forEach(line=>{const i=line.indexOf(':');if(i>0)specifications[line.slice(0,i).trim()]=line.slice(i+1).trim();});
    const payload={name:form.name.trim(),slug:slugify(form.slug||form.name),brand:form.brand.trim(),category:form.category,short_description:form.short_description.trim(),description:form.description.trim(),image_url:form.image_url.trim(),amazon_url:form.amazon_url.trim(),price_note:form.price_note.trim(),specifications,pros:form.pros.split('\n').map(x=>x.trim()).filter(Boolean),cons:form.cons.split('\n').map(x=>x.trim()).filter(Boolean),featured:form.featured,status:form.status,updated_at:new Date().toISOString()};
    const result=editing?await supabase.from('products').update(payload).eq('id',editing):await supabase.from('products').insert(payload);
    if(result.error)setError(result.error.message);else{setNotice(editing?'Product updated.':'Product added.');reset();await loadProducts();}
    setSaving(false);
  }
  async function remove(p:Product){if(!supabase||!confirm(`Delete “${p.name}”? This cannot be undone.`))return;const {error}=await supabase.from('products').delete().eq('id',p.id);if(error)setError(error.message);else{setNotice('Product deleted.');loadProducts();}}

  if(!isSupabaseConfigured)return <div className="admin-wrap"><div className="admin-card"><h1>Connect your product database</h1><p>Add your Supabase project URL and anon key to <code>.env.local</code>, then run the SQL setup file included with this project.</p><p>See <code>ADMIN-SETUP.md</code> for the complete setup guide.</p></div></div>;
  if(loading)return <div className="admin-wrap"><p>Loading admin…</p></div>;
  if(!session)return <div className="admin-wrap"><form className="admin-card login-card" onSubmit={login}><div className="admin-kicker">HIGHBROW SHOP / PRIVATE AREA</div><h1>Admin sign in</h1><p>Sign in with the administrator account configured in Supabase.</p>{error&&<div className="admin-alert">{error}</div>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label><button className="admin-primary">Sign in</button><Link href="/" className="admin-back">Back to shop</Link></form></div>;
  if(adminCheckLoading)return <div className="admin-wrap"><p>Checking administrator access…</p></div>;
  if(!isAdmin)return <div className="admin-wrap"><div className="admin-card"><h1>Admin access required</h1><p>This account is signed in, but it is not listed as an administrator for this website.</p><button className="admin-secondary" onClick={logout}>Sign out</button></div></div>;

  return <div className="admin-wrap"><div className="admin-shell"><aside className="admin-sidebar"><Link href="/" className="admin-brand">H <span>HIGHBROW<br/>SHOP</span></Link><div className="admin-side-label">WORKSPACE</div><div className="admin-side-active"><LayoutDashboard size={17}/> Overview</div><div className="admin-side-active"><PackagePlus size={17}/> Products</div><div className="admin-side-label">WEBSITE</div><Link href="/products" className="admin-side-link">View product catalogue <ExternalLink size={14}/></Link><Link href="/" className="admin-side-link">Public homepage <ExternalLink size={14}/></Link><button className="admin-logout" onClick={logout}><LogOut size={16}/> Sign out</button></aside>
    <section className="admin-main"><div className="admin-top"><div><div className="admin-kicker">PRODUCT MANAGEMENT</div><h1>Products</h1><p>Add, edit and publish products in your catalogue.</p></div><div className="admin-user">{session.user.email}</div></div>
    {error&&<div className="admin-alert">{error}</div>}{notice&&<div className="admin-notice">{notice}</div>}
    <div className="admin-stats"><div><span>Total products</span><strong>{products.length}</strong></div><div><span>Published</span><strong>{products.filter(p=>p.status==='published').length}</strong></div><div><span>Drafts</span><strong>{products.filter(p=>p.status==='draft').length}</strong></div></div>
    <form className="admin-card product-form" onSubmit={save}><div className="admin-form-heading"><div><div className="admin-kicker">{editing?'EDIT PRODUCT':'NEW LISTING'}</div><h2>{editing?'Update product':'Add a product'}</h2></div>{editing&&<button type="button" className="admin-secondary" onClick={reset}>Cancel edit</button>}</div>
      <div className="admin-fields"><label>Product name *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:editing?form.slug:slugify(e.target.value)})} placeholder="e.g. Elgato HD60 X"/></label><label>URL slug<input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="elgato-hd60-x"/></label><label>Brand<input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} placeholder="Elgato"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label className="wide">Short description<input value={form.short_description} onChange={e=>setForm({...form,short_description:e.target.value})} placeholder="A concise summary shown on product cards"/></label><label className="wide">Full description<textarea rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What it does, who it suits, and what buyers should know"/></label>
      <label className="wide">Product image URL<input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://… or upload an image below"/></label><label className="wide upload-label"><ImagePlus size={17}/> Upload image (JPG, PNG or WebP · max 5 MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>uploadImage(e.target.files?.[0])}/></label>{form.image_url&&<div className="admin-image-preview"><img src={form.image_url} alt="Product preview"/><span>Image preview</span></div>}
      <label className="wide">Amazon product URL<input type="url" value={form.amazon_url} onChange={e=>setForm({...form,amazon_url:e.target.value})} placeholder="https://www.amazon.in/dp/…"/></label><label>Price note<input value={form.price_note} onChange={e=>setForm({...form,price_note:e.target.value})} placeholder="Check current price on Amazon"/></label><label>Specifications (one per line, Key: Value)<textarea rows={4} value={form.specs} onChange={e=>setForm({...form,specs:e.target.value})} placeholder={'Interface: USB 3.0\nResolution: 1080p60'}/></label><label>Pros (one per line)<textarea rows={4} value={form.pros} onChange={e=>setForm({...form,pros:e.target.value})} placeholder="What you like about it"/></label><label>Cons (one per line)<textarea rows={4} value={form.cons} onChange={e=>setForm({...form,cons:e.target.value})} placeholder="Limitations to disclose"/></label></div>
      <div className="admin-form-bottom"><label className="check-label"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Feature on homepage</label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as 'draft'|'published'})}><option value="draft">Draft</option><option value="published">Published</option></select></label><button className="admin-primary" disabled={saving}>{saving?'Saving…':editing?'Save changes':'Add product'}</button></div>
    </form>
    <div className="admin-list-heading"><div><div className="admin-kicker">YOUR CATALOGUE</div><h2>All products <span>{products.length}</span></h2></div><input className="admin-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"/></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><div className="admin-product-cell">{p.image_url?<img src={p.image_url} alt=""/>:<div className="admin-no-image">IMG</div>}<div><strong>{p.name}</strong><small>{p.brand} · /products/{p.slug}</small></div></div></td><td>{p.category}</td><td><span className={`status-pill ${p.status}`}>{p.status}</span></td><td>{p.featured?'Yes':'—'}</td><td><div className="admin-actions"><button title="Edit" onClick={()=>edit(p)}><Pencil size={16}/></button><button title="Delete" onClick={()=>remove(p)}><Trash2 size={16}/></button></div></td></tr>)}{filtered.length===0&&<tr><td colSpan={5} className="admin-empty">No products yet. Add your first product above.</td></tr>}</tbody></table></div>
    </section></div></div>;
}
