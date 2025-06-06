import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { CustomerContextProvider } from './components/ContextProvider/CustomerContext';  // Import your CustomerContextProvider

// Pages routes
import Landing from './pages/landing';
import Login from './pages/login';
import Register from './pages/register';
import Super from './pages/superAdmin';
import Admin from './pages/admin';
import Menu from './pages/Menu';
import Error from './pages/error';
import Info from './pages/info';
import UnAuthorized from './pages/unAuthorized';
import Loding from './pages/loding';
import Inactive from './pages/inactive';
import ResetPassword from './pages/resetPassword';
import RequestResetPassword from './pages/requestResetPassword';
export default function App() {
  return (
    <div className='bg-gray-950 text-slate-300 h-screen'>
      <CustomerContextProvider> {/* Wrap everything with the CustomerContextProvider */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/super" element={<Super />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/info/:AdminId/:tableId" element={<Info />} />
            <Route path="/menu/*" element={<Menu />} /> 
            <Route path="*" element={<Error />} /> 
            <Route path="/unAuthorized" element={<UnAuthorized />} />
            <Route path="/loding" element={<Loding />} />
            <Route path="/inactive" element={<Inactive />} />
            <Route path="/forgot-password" element={<RequestResetPassword/>}/>
            <Route path="/reset-password/:token/:role" element={<ResetPassword/>}/>
            {/* Add more routes as needed */}
          </Routes>
        </BrowserRouter>
      </CustomerContextProvider>
    </div>
  );
}