import { useState, useEffect } from 'react';
import { viewDepartmentsByManager, viewTheEmployeeDetails, viewAllEmployeesInDeptByManager, viewAllBudgetRequestsInDeptByManager, updateStatusOfBudget } from '../api/axios';

const ManagerPanel = ({ userId }) => {
  // --- CORE STATE LAYERS ---
  const [managerProfile, setManagerProfile] = useState(null);
  const [managerDepartments, setManagerDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection states for drilling down into a department
  const [activeDept, setActiveDept] = useState(null); // Stores the currently viewed department object
  const [viewMode, setViewMode] = useState(null);       // Toggles between 'STAFF' or 'BUDGETS'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  
  // Data stores filled on-demand (lazy loaded)
  const [staffList, setStaffList] = useState([]);
  const [budgetList, setBudgetList] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null); // Tracks layout spinner on individual row update

  // ==========================================
  // 1. INITIAL MOUNT: FETCH MANAGER PROFILE
  // ==========================================
    useEffect(() => {
        let isMounted = true;
        const fetchManagerProfile = async () => {
            try {
                setLoading(true);
                // e.g., const res = await API.get(`/manager/profile?id=${userId}`);
                // Expected mock layout structure: 
                // TODO: REPLACE WITH YOUR PROFILE ENDPOINT
                // { name: 'johnd', fullName: 'John Doe', designation: 'Regional Director', departments: [{id: 1, name: 'Finance'}, {id: 2, name: 'Operations'}] }
                const[profileData, deptData] = await Promise.all([
                    viewTheEmployeeDetails.getProfile(userId),
                    viewDepartmentsByManager.getDepartmentsByManager(userId)
                ]);

                if (isMounted) {
                    setManagerProfile(profileData);
                    setManagerDepartments(deptData);
                }
            } catch (err) {
                console.error("Failed to load manager context:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (userId) fetchManagerProfile();
        return () => { isMounted = false; };
    }, [userId]);

  // ==========================================
  // 2. LAZY LOAD ROUTINES (ON-DEMAND SELECTION)
  // ==========================================
  
  // Triggered when clicking Option A: View All Users
  const handleViewStaff = async (dept) => {
    try {
      setActiveDept(dept);
      setViewMode('STAFF');
      
      // TODO: REPLACE WITH YOUR USERS BY DEPARTMENT ENDPOINT
      // e.g., const res = await API.get(`/departments/${dept.id}/users`);
      const employeesInDepartment = await viewAllEmployeesInDeptByManager.getAllEmployeesInDeptByManager(dept.id);
      setStaffList(employeesInDepartment);
    } catch (err) {
      console.error("Failed to retrieve department staff list:", err);
    }
  };

  // Triggered when clicking Option B: View All Budget Requests
  const handleViewBudgets = async (dept) => {
    try {
      setActiveDept(dept);
      setViewMode('BUDGETS');
      setStatusFilter('ALL'); // Default filter to see everything initially
      
      // TODO: REPLACE WITH YOUR BUDGETS BY DEPARTMENT ENDPOINT
      // e.g., const res = await API.get(`/budget/department/${dept.id}`);
      const budgetRequestsInDepartment = await viewAllBudgetRequestsInDeptByManager.getAllBudgetRequestsInDeptByManager(dept.id);
      setBudgetList(budgetRequestsInDepartment);
    } catch (err) {
      console.error("Failed to retrieve department budgets matrix:", err);
    }
  };

  // Triggered when clicking Approve or Reject inline action buttons
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      setActionLoadingId(requestId);
      
      // TODO: REPLACE WITH YOUR STATUS UPDATE ACTION ENDPOINT
      // e.g., await API.put(`/budget/${requestId}/status`, { status: newStatus }); or query parameters

      await updateStatusOfBudget.updateStatusOfBudgetByManager(requestId, newStatus);

      const targetRequest = budgetList.find(item => item.id === requestId);
      const requestAmount = targetRequest ? targetRequest.amount : 0;
      
      if (newStatus === 'APPROVED' && activeDept) {
        setManagerDepartments(prevDepts => {
          if (!prevDepts) return prevDepts;
          
          return prevDepts.map(dept => {
            if (dept.id === activeDept.id) {
              const freshRemaining = Math.max(0, (dept.remainingBudget || 0) - requestAmount);
            
              return {
                ...dept,
                remainingBudget: freshRemaining
              };
            }
            return dept;
          });
        });
      }
      // Optimistic/Local UI State Synchronizer: Immediately reflect change in view list
      setBudgetList(prev => 
        prev.map(item => item.id === requestId ? { ...item, status: newStatus } : item)
      );
    } catch (err) {
      console.error("Could not complete review action authorization:", err);
      alert("Failed to modify record authorization status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- FILTER COMPUTATION SEGMENT ---
  const filteredBudgets = budgetList.filter(req => {
    if (statusFilter === 'ALL') return true;
    return req.status === statusFilter;
  });

  if (loading) {
    return <div className="text-center py-12 text-gray-500 font-medium">Loading Authorization Dashboard Matrix...</div>;
  }

  return (
    <div className="space-y-8 mt-8">
      
      {/* ────────────────────────────────────────────────────────
          SECTION 1: MANAGER PROFILE BANNER CARD 
          ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Manager Control Environment
          </span>
          <h2 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">
            Welcome Back, {managerProfile?.fullName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            • Role: <span className="font-medium text-gray-700">{managerProfile?.designation}</span>
          </p>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          SECTION 2: ASSIGNED DEPARTMENTS CARD LIST GRID
          ──────────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-4">Your Department Jurisdictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {managerDepartments?.map((dept) => {
            const maxBudget = dept.maxBudget || 1; // Fallback to avoid division by zero
            const remainingBudget = dept.remainingBudget || 0;
            const spentBudget = Math.max(0, maxBudget - remainingBudget);
            const percentUsed = Math.min(100, (spentBudget / maxBudget) * 100);

            const isOverBudget = percentUsed >= 90;
            const barColor = isOverBudget ? 'bg-red-500' : percentUsed >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

            return(
              <div 
              key={dept.id} 
              className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all duration-150 ${activeDept?.id === dept.id ? 'border-indigo-500 ring-2 ring-indigo-50/50' : 'border-gray-100'}`}
              >
                <div>
                  {/* <span className="text-xs font-mono font-bold text-gray-400 uppercase">{dept.code}</span> */}
                  <h4 className="text-lg font-bold text-gray-900 mt-1">{dept.name}</h4>

                  <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100/60">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className="text-gray-500">Remaining Tracker</span>
                      <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-gray-700'}>
                      ${remainingBudget.toLocaleString()} / <span className="text-gray-400">${maxBudget.toLocaleString()}</span>
                      </span>
                    </div>
                    
                    {/* Outer Track */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      {/* Inner Filled Progress */}
                      <div 
                      className={`h-full ${barColor} transition-all duration-500 ease-out`}
                      style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                      <span>{percentUsed.toFixed(0)}% Utilized</span>
                      <span>${spentBudget.toLocaleString()} Spent</span>
                    </div>
                  </div>
                </div>
                
                {/* Dual Action Options Router Block */}
                <div className="flex items-center space-x-2 mt-6">
                  <button
                    onClick={() => handleViewStaff(dept)}
                    className={`flex-1 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors ${activeDept?.id === dept.id && viewMode === 'STAFF' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                    View Staff Personnel
                  </button>
                  <button
                    onClick={() => handleViewBudgets(dept)}
                    className={`flex-1 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors ${activeDept?.id === dept.id && viewMode === 'BUDGETS' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                    View Budget Matrix
                  </button>
                </div>
              </div>
            );
            })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          SECTION 3: ON-DEMAND SUB-CONSOLE DATA WORKSPACE
          ──────────────────────────────────────────────────────── */}
      {activeDept && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
          
          {/* Subsection Workspace Context Header Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-900 text-base">
                {activeDept.name} Exploration Matrix
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Currently displaying: {viewMode === 'STAFF' ? 'Active Personnel Directory' : 'Expense & Capital Allocation Registry'}
              </p>
            </div>
            
            {/* Context Switch Toggle inside the workspace view */}
            <div className="flex space-x-1 bg-gray-200/60 p-1 rounded-xl text-xs font-semibold">
              <button 
                onClick={() => setViewMode('STAFF')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'STAFF' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Staff
              </button>
              <button 
                onClick={() => handleViewBudgets(activeDept)} 
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'BUDGETS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Budgets
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* SUB-VIEW 3A: STAFF GRID VIEW LIST */}
            {viewMode === 'STAFF' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Full Name</th>
                      {/* <th className="pb-3 font-semibold">System Handle ID</th> */}
                      <th className="pb-3 font-semibold text-right">Corporate Designation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {staffList.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-3.5 font-semibold text-gray-900">{user.fullName}</td>
                        {/* <td className="py-3.5 font-mono text-gray-500">{user.name}</td> */}
                        <td className="py-3.5 text-right font-medium text-gray-600">{user.designation}</td>
                      </tr>
                    ))}
                    {staffList.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center py-6 text-gray-400 text-xs">No personnel registered to this jurisdiction module.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-VIEW 3B: BUDGET MATRIX WITH LIVE MANAGEMENT FILTERS */}
            {viewMode === 'BUDGETS' && (
              <div className="space-y-4">
                
                {/* ADVANCED STATUS FILTER ROW */}
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${statusFilter === status 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                    >
                      {status} ({status === 'ALL' ? budgetList.length : budgetList.filter(b => b.status === status).length})
                    </button>
                  ))}
                </div>

                {/* THE BUDGET TRANSACTIONS RECORD MATRIX */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Request Item</th>
                        <th className="pb-3 font-semibold">Originator</th>
                        <th className="pb-3 font-semibold">Capital Required</th>
                        <th className="pb-3 font-semibold">Review State</th>
                        <th className="pb-3 font-semibold text-right">Decision Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {filteredBudgets.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="py-4 max-w-xs">
                            <h5 className="font-bold text-gray-900">{req.title}</h5>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{req.description}</p>
                          </td>
                          <td className="py-4 font-medium text-gray-600 text-xs">{req.employeeName}</td>
                          <td className="py-4 font-mono font-bold text-gray-900">${req.amount.toFixed(2)}</td>
                          <td className="py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${req.status === 'APPROVED' ? 'bg-green-50 text-green-700' : req.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                              {req.status}
                            </span>
                          </td>
                          
                          {/* THE APPROVAL/REJECTION CONTROL CENTER CELL */}
                          <td className="py-4 text-right">
                            {actionLoadingId === req.id ? (
                              <span className="text-xs text-gray-400 animate-pulse font-medium">Processing...</span>
                            ) : req.id && req.status === 'PENDING' ? (
                              <div className="inline-flex space-x-1.5">
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                                <span className="text-xs font-medium text-gray-400 italic">
                                    Decision Finalized
                                </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredBudgets.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-400 text-xs font-medium">
                            No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} requests recorded in this system frame context.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default ManagerPanel;