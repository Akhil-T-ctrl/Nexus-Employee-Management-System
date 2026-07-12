import AdminPanel from '../components/AdminPanel';
import ManagerPanel from '../components/ManagerPanel';
import UserPanel from '../components/UserPanel';

const Dashboard = () => {
  const handleLogout = () => {
    // 1. Wipe the browser memory clean
    localStorage.clear();
    sessionStorage.clear();

    // 2. Hard redirect the browser back to the login screen
    window.location.href = '/login';
  };

  const user = JSON.parse(localStorage.getItem('user')); // { id, role }

  // console.log("user from storage",user);

  const currentUserId = user?.userId;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40 rounded-2xl">
        <div className="flex items-center space-x-3">

          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M3 12a48.654 48.654 0 011.066-6.324m0 0A4.006 4.006 0 017.766 2.5a48.663 48.663 0 018.468 0 4.006 4.006 0 013.7 3.176m-16.866 3.148A48.656 48.656 0 003 12m0 0l-3-3m3 3l3-3M3.137 15.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M3 12l-3 3m3-3l3 3M21 12a48.654 48.654 0 01-1.066 6.324m0 0a4.006 4.006 0 01-3.7 3.176 48.663 48.663 0 01-8.468 0 4.006 4.006 0 01-3.7-3.176m16.866-3.148a48.656 48.656 0 00.138-3.662m0 0l3 3m-3-3l-3 3" />
          </svg>

          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Ledger Flow EMS</h1>
        </div>

        {/* LOGOUT SESSION TRIGGER */}
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-xl border border-gray-100 hover:border-red-100 transition-all duration-150 shadow-sm"
        >
          Logout Session
        </button>
      </header>

      {/* Logic to choose panel based on role */}
      {/* {user.role === 'ROLE_EMPLOYEE' && <UserPanel userId={user.userId} />} */}
      {/* {user.role === 'ROLE_MANAGER' && <ManagerPanel userId={user.id} />} */}

      {user?.role === 'ROLE_EMPLOYEE' ? (
        <UserPanel userId={currentUserId} />
      ) : user?.role === 'ROLE_MANAGER' ? (
        <ManagerPanel userId={currentUserId} />
      ) : user?.role === 'ROLE_ADMIN' ? (
        <AdminPanel userId={currentUserId} />
      ) : (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          Error: No user ID found in storage. Please log out and log back in.
        </div>
      )}
    </div>
  );
};

export default Dashboard;