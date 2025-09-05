import { useEffect, useMemo, useState } from 'react'
import * as api from './api'

function Header({ user, onLogout, cartCount }) {
  return (
    <div className="header container">
      <div className="brand">🛍️ Dev Shop</div>
      <div>
        {user ? (
          <>
            <span style={{marginRight:12}}>Hello, {user.name}</span>
            <button className="button" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <span style={{color:'#374151'}}>Please login / signup</span>
        )}
        <span style={{marginLeft:16}}>🛒 {cartCount}</span>
      </div>
    </div>
  )
}

function ProductCard({ p, onAdd }) {
  return (
    <div className="card">
      <img src={p.image_url} alt={p.name} style={{width:'100%', height:160, objectFit:'cover', borderRadius:8}} />
      <h3 style={{margin:'8px 0'}}>{p.name}</h3>
      <div style={{color:'#374151'}}>₹{p.price}</div>
      <div style={{marginTop:8}}>
        <button className="button" onClick={() => onAdd(p)}>Add to Cart</button>
      </div>
    </div>
  )
}

export default function App(){
  const [view,setView] = useState('products')
  const [products,setProducts] = useState([])
  const [token,setToken] = useState(localStorage.getItem('token'))
  const [user,setUser] = useState(null)
  const [cart,setCart] = useState([])
  const [checkoutStatus,setCheckoutStatus] = useState(null)

  useEffect(()=>{ api.listProducts().then(r=>setProducts(r.data)) },[])

  useEffect(()=>{ if(token){ api.me(token).then(r=>setUser(r.data)).catch(()=>{ setToken(null); localStorage.removeItem('token') }) } },[token])

  useEffect(()=>{ if(token){ api.getCart(token).then(r=>setCart(r.data)).catch(()=>setCart([])) } },[token, view])

  const cartCount = cart.length

  function onAdd(p){
    if(!user){ setView('auth'); return }
    api.addToCart(token, { productId: p.id, qty: 1 }).then(()=> api.getCart(token).then(r=>setCart(r.data)))
  }

  function onLogout(){ setUser(null); setToken(null); localStorage.removeItem('token') }

  function doCheckout(){
    api.checkout(token).then(r=>{ setCheckoutStatus(r.data.status); setView('checkout') }).catch(e=>{ setCheckoutStatus('FAILED'); setView('checkout') })
  }

  return (
    <div>
      <Header user={user} onLogout={onLogout} cartCount={cartCount} />
      <div className="container">
        <div style={{display:'flex',gap:12,marginBottom:12}}>
          <button className="button" onClick={()=>setView('products')}>Products</button>
          <button className="button" onClick={()=>setView('cart')}>Cart</button>
          <button className="button" onClick={()=>setView('auth')}>Login/Signup</button>
        </div>

        {view==='products' && (
          <div className="grid">
            {products.map(p=> <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
          </div>
        )}

        {view==='cart' && (
          <div className="card" style={{padding:20}}>
            <h3>Your Cart</h3>
            {!cart.length && <p>Cart is empty</p>}
            {cart.map(item=> (
              <div key={item.id} style={{display:'flex',gap:12,alignItems:'center',padding:'8px 0'}}>
                <img src={item.image_url} width="72" height="56" style={{borderRadius:8,objectFit:'cover'}}/>
                <div style={{flex:1}}>
                  <div>{item.name}</div>
                  <div style={{color:'#6b7280'}}>Qty: {item.qty}</div>
                </div>
                <div style={{fontWeight:700}}>₹{(Number(item.price)*Number(item.qty)).toFixed(2)}</div>
              </div>
            ))}
            {!!cart.length && (
              <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
                <div style={{fontWeight:700}}>Total: ₹{cart.reduce((s,i)=> s + Number(i.price)*Number(i.qty),0).toFixed(2)}</div>
                <button className="button" onClick={doCheckout}>Checkout</button>
              </div>
            )}
          </div>
        )}

        {view==='auth' && <Auth onLogin={(t)=>{ setToken(t); localStorage.setItem('token',t); setView('products') }} />}

        {view==='checkout' && (
          <div className="card" style={{padding:20}}>
            <h3>Checkout</h3>
            {checkoutStatus === 'PAID' ? <p>✅ Payment successful. Thank you!</p> : <p>❌ Payment failed. Try again.</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function Auth({ onLogin }){
  const [mode,setMode] = useState('login')
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  function submit(e){
    e.preventDefault()
    if(mode==='signup'){
      api.signup({ name, email, password }).then(()=> { alert('Created. Please login'); setMode('login') }).catch(err=> alert(err.response?.data?.error || 'Signup failed'))
    } else {
      api.login({ email, password }).then(r=> onLogin(r.data.token)).catch(()=> alert('Login failed'))
    }
  }

  return (
    <div className="card" style={{maxWidth:420, margin:'0 auto', padding:20}}>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="button" onClick={()=>setMode('login')}>Login</button>
        <button className="button" onClick={()=>setMode('signup')}>Sign Up</button>
      </div>
      <form onSubmit={submit}>
        {mode==='signup' && <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />}
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="button" type="submit" style={{marginTop:8}}>{mode==='signup'?'Create Account':'Login'}</button>
      </form>
    </div>
  )
}

