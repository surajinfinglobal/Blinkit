import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import AdminPanel from '../admin/AdminPanel'
import StartScreen from './pages/StartScreen.jsx'
import PulseSplash from './components/PulseSplash.jsx';
import Landing from './pages/Landing.jsx'
import LandingDelivery from './pages/LandingDelivery.jsx'
import LandingPayment from './pages/LandingPayment.jsx'
import Login from './pages/Login.jsx'
import Welcome from './pages/Welcome.jsx'
import Registraion from './pages/Registraion.jsx'
import PhoneVerify from './pages/PhoneVerify.jsx'
import OtpVerification from './pages/OtpVerification.jsx'
import Home from './pages/Home.jsx'
import CheckoutPayment from './pages/CheckoutPayment.jsx'
import Cart from './pages/Cart.jsx' 
import Receipt from './components/Receipt.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Confirmorder from './pages/Confirmorder.jsx'
import BottomNav from './components/BottomNav.jsx'
import UserProfile from './pages/UserProfile.jsx'
import TrackOrder from './pages/TrackOrder.jsx'
import Deleverd from './pages/Deleverd.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LocationChip from './components/LocationChip';

function AppLayout() {
  const location = useLocation()

  const showBottomNav = [
    '/home',
    '/cart',
    '/MyOrders',
    '/account',
    '/wishlist',
  ].includes(location.pathname)

  

  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/" element={<StartScreen/>}/>
        <Route path="/landing" element={<Landing />} />
        <Route path="/delivery" element={<LandingDelivery />} />
        <Route path="/payment" element={<LandingPayment />} />
        <Route path="/Welcome" element={<Welcome />} />
        <Route path="/register" element={<Registraion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/phone" element={<PhoneVerify />} />
        <Route path="/otp" element={<OtpVerification />} />
       {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="PulseSplash" element={<PulseSplash/>}/>
          <Route path="/location" element={<LocationChip />}/>
          <Route path="/cart" element={<Cart />} />
          <Route path="/MyOrders" element={<MyOrders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/Receipt" element={<Receipt />} />
          <Route path="/Confirmorder" element={<Confirmorder />} />
          <Route path="/TrackOrder" element={<TrackOrder />} />
          <Route path="/Deleverd" element={<Deleverd/>}/>
          <Route path="/CheckoutPayment" element={<CheckoutPayment />} />
          <Route path="/account" element={<UserProfile />} />
        </Route>
      </Routes>

      {showBottomNav && <BottomNav />}
    </>
  )
}


export default function App() {
  return (
    <BrowserRouter>
     {/* <CartProvider> */}
        <AppLayout />
      {/* </CartProvider> */}
    </BrowserRouter>
  )
}