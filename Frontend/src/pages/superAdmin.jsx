import  { useState,useEffect,useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import {LoginContext} from '../components/ContextProvider/Context';

/* Components */
import Sidebar from '../components/superAdmin/main/Sidebar';
import Header from '../components/superAdmin/main/Header';
/* My Pages */
import Dashboard from '../components/superAdmin/pages/Dashboard';
import Admin from '../components/superAdmin/pages/Admin';
import UsersInfo from '../components/superAdmin/pages/UserInfo';
import Setting from '../components/superAdmin/pages/Setting';
import Profile from '../components/superAdmin/pages/Profile';
const API_URL = import.meta.env.VITE_API_URL;

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [sidebar,setSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard'); // Track current page
  const [headerTitle, setHeaderTitle] = useState('Dashboard'); // Track header title
  const { setLoginData} = useContext(LoginContext)
  // Profile Drop Down
  const [profile,setProfile] = useState();
    const profileClick =()=>{
      setProfile(!profile);
      setSidebar(false);
    }

  const toggleSidebar =()=>{
    setSidebar(!sidebar);
    setProfile(false);
  }

  const SuperAdmin = async()=>{
    let token = localStorage.getItem("TokenFoodMe");
    const res = await fetch(`${API_URL}/api/validUser`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      }
    });
    const data = await res.json();
    if(res.status === 401 || !data || data.validUser.role !== "super"){
      navigate("/unAuthorized");
      return;
    }
    
    // Check if the user account is inactive
    if(data.isInactive){
      navigate("/inactive");
      return;
    }
    
    setLoginData(data);
    navigate("/super");
  }
  
  useEffect(()=>{
    SuperAdmin();
  },[])

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setHeaderTitle(page); // Set header title to the selected page
  };

  return (
    <div className='flex w-full'>
      <div className={`border-r border-gray-600 rounded-2xl md:rounded-none top-0 left-0 transition-all duration-500 overflow-hidden bg-gray-900  h-screen z-50 ${!sidebar ? "-translate-x-full md:translate-x-0 absolute md:relative w-0  md:w-[20vw]": "translate-x-0 md:-translate-x-full absolute md:relative w-[80%] md:w-0"}`}>
        <Sidebar setSidebar={setSidebar} handlePageChange={handlePageChange} currentPage={currentPage}/>
      </div>
      <div className='w-full'>
        <div className='p-3 shadow-md'>
          <Header toggleSidebar={toggleSidebar} profileClick={profileClick} profile={profile} title={headerTitle} handlePageChange={handlePageChange}/>
        </div>
        <div className='p-3 h-[92vh] overflow-y-auto'>
          {/* Render the current page component */}
          {currentPage === 'Dashboard' && <Dashboard />}
          {currentPage === 'My Admin' && <Admin />}
          {currentPage === 'Users Info' && <UsersInfo />}
          {currentPage === 'Setting' && <Setting handlePageChange={handlePageChange}/>}
          {currentPage === 'Profile' && <Profile handlePageChange={handlePageChange}/>}

        </div>
      </div>
    </div>
  );
}
