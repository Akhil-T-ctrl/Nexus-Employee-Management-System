import { useState, useEffect } from 'react';
import { createDepartment, createUserOrManager, deleteDepartment, deleteUserOrManager, updateManagerOfDept, updateUserOrManager, viewAllBudgetRequestsInDeptByManager, viewAllDepartments, viewAllEmployeesInDeptByManager, viewAllManagers, viewDepartmentsByManager, viewTheEmployeeDetails } from '../api/axios';

// NOTE: Make sure to import or pass your budgetService / apiService if named differently
// import { apiService } from '../../services/apiService'; 

export default function AdminPanel({ userId }) {
  // ────────────────────────────────────────────────────────
  // 1. STATE MANAGEMENT HOARDS
  // ────────────────────────────────────────────────────────
  const [adminDetails, setAdminDetails] = useState(null);
  const [managersList, setManagersList] = useState([]);
  const [globalDepartments, setGlobalDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]); // Departments under a specific selected manager
  const [subBudgets, setSubBudgets] = useState([]);         // Budget requests for read-only view
  const [subEmployees, setSubEmployees] = useState([]);     // Employee list for a department

  // UI Flow Control States
  const [currentView, setCurrentView] = useState('MANAGERS'); // 'MANAGERS' or 'GLOBAL_DEPTS'
  const [activeManager, setActiveManager] = useState(null);   // Manager clicked for sub-views
  const [activeDept, setActiveDept] = useState(null);         // Dept clicked for sub-views
  const [subWorkspaceMode, setSubWorkspaceMode] = useState(null); // 'BUDGETS' or 'EMPLOYEES'

  // Loading States
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [targetFormRole, setTargetFormRole] = useState(''); // 'MANAGER' or 'EMPLOYEE'
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    designation: '',
    role: '',
    departmentId: null
  });

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptFormData, setDeptFormData] = useState({
    name: '',
    maxBudget: '',
    managerId: null
  });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDeptToReassign, setSelectedDeptToReassign] = useState(null);
  const [chosenManagerId, setChosenManagerId] = useState('');

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [targetUpdateUser, setTargetUpdateUser] = useState(null); // Tracks the user being modified
  const [updateFormData, setUpdateFormData] = useState({
    username: '',
    password: '',
    fullName: ''
  });

  // 1. Opens the modal and pre-populates current readable info
  const handleOpenUpdateModal = (user) => {
    setTargetUpdateUser(user);
    setUpdateFormData({
      username: user.username || '',
      password: '', // Keep password blank for security; only update if they type a new one
      fullName: user.name || user.fullName || ''
    });
    setIsUpdateModalOpen(true);
  };

  // 2. Dispatches the updated DTO to your backend
  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!targetUpdateUser) return;

    try {
      setActionLoadingId(`update-user-${targetUpdateUser.id}`);

      // Call Axios passing the user ID and form data DTO
      const res = await updateUserOrManager.ByAdmin(targetUpdateUser.id, updateFormData);
      const updatedUser = res.data; // Server returns the updated profile object

      // Instantly refresh the employee list state if editing someone in the active department view
      setSubEmployees(prev =>
        prev.map(emp => emp.id === targetUpdateUser.id ? { ...emp, ...updatedUser } : emp)
      );

      // Instantly refresh the managers list state if editing a manager profile
      setManagersList(prev =>
        prev.map(mgr => mgr.id === targetUpdateUser.id ? { ...mgr, ...updatedUser } : mgr)
      );

      alert("User profile information successfully updated.");
      setIsUpdateModalOpen(false);
    } catch (err) {
      console.error("Profile modification request rejected:", err);
      alert("Failed to modify user credentials. Ensure the username is unique.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ────────────────────────────────────────────────────────
  // 2. DATA INITIALIZATION HOOK
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialAdminData = async () => {
      try {
        setPageLoading(true);

        // 🛠️ PLACEHOLDER: Fetch Admin Personal Bio Details
        // const adminRes = await apiService.getAdminProfile(userId);
        // setAdminDetails(adminRes.data);

        const adminDetails = await viewTheEmployeeDetails.getProfile(userId);
        setAdminDetails(adminDetails);

        // 🛠️ PLACEHOLDER: Fetch Master Managers Array Listing
        // const managersRes = await apiService.getAllManagers();
        // setManagersList(managersRes.data);

        const managerDetails = await viewAllManagers.ByAdmin();
        setManagersList(managerDetails);

        // 🛠️ PLACEHOLDER: Fetch All Global Corporate Departments Matrix
        // const deptsRes = await apiService.getAllDepartmentsGlobal();
        // setGlobalDepartments(deptsRes.data);

        const DepartmentsByAdmin = await viewAllDepartments.ByAdmin();
        setGlobalDepartments(DepartmentsByAdmin);

      } catch (err) {
        console.error("Initialization sequence broken:", err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchInitialAdminData();
  }, [userId]);

  // ────────────────────────────────────────────────────────
  // 3. CORE ACTION HANDLERS (API INTEGRATION ZONES)
  // ────────────────────────────────────────────────────────

  const handleCreateManager = async () => {
    setTargetFormRole('MANAGER');
    setUserFormData({
      username: '',
      password: '',
      fullName: '',
      designation: '', // default designation
      role: 'ROLE_MANAGER',
      departmentId: null // explicitly null as per your backend requirement
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteManager = async (managerId) => {
    if (!window.confirm("Are you absolutely sure you want to terminate this manager profile?")) return;

    try {
      setActionLoadingId(`del-mgr-${managerId}`);
      // 🛠️ PLACEHOLDER: Call Delete Manager API Endpoint
      // await apiService.deleteManager(managerId);

      await deleteUserOrManager.ByAdmin(managerId);

      setManagersList(prev => prev.filter(m => m.id !== managerId));
      alert("Manager account removed successfully.");
    } catch (err) {
      console.error("Could not delete manager record:", err.response?.data?.message);
      alert(`Action Denied: Manager seems to have assigned departments under him, ${err.response?.data?.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewManagerDepartments = async (manager) => {
    setActiveManager(manager);
    setActiveDept(null);
    setSubWorkspaceMode(null);

    try {
      // 🛠️ PLACEHOLDER: Fetch Departments explicitly owned by this specific manager
      // const res = await apiService.getDepartmentsByManager(manager.id);
      // setSubDepartments(res.data);

      const departments = await viewDepartmentsByManager.getDepartmentsByManager(manager.id);

      // Mock Data match simulation
      setSubDepartments(departments);
    } catch (err) {
      console.error("Could not pull manager assigned departments:", err);
    }
  };

  const handleCreateDepartment = async () => {
    if (!activeManager) return;
    setDeptFormData({
      name: '',
      maxBudget: '',
      managerId: activeManager.id // Automatically grab the manager ID from the active view state!
    });
    setIsDeptModalOpen(true);
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm("Are you sure you want to delete this department? This cannot be undone.")) return;

    try {
      setActionLoadingId(`del-dept-${deptId}`);
      // 🛠️ PLACEHOLDER: Call Delete Department Endpoint
      // await apiService.deleteDepartment(deptId);

      await deleteDepartment.ByAdmin(deptId);

      setSubDepartments(prev => prev.filter(d => d.id !== deptId));
      setGlobalDepartments(prev => prev.filter(d => d.id !== deptId));
      if (activeDept?.id === deptId) {
        setActiveDept(null);
        setSubWorkspaceMode(null);
        setSubEmployees([]); // Wipes out stale cascading employee arrays
        setSubBudgets([])
      }
      alert("Department removed successfully.");
    } catch (err) {
      console.error("Failed to delete department:", err);
      alert("Could not process department erasure.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewBudgetsReadOnly = async (dept) => {
    setActiveDept(dept);
    setSubWorkspaceMode('BUDGETS');
    try {
      // 🛠️ PLACEHOLDER: Fetch requests without modification requirements
      // const res = await apiService.getBudgetsByDepartment(dept.id);
      // setSubBudgets(res.data);

      const budgetsReadOnly = await viewAllBudgetRequestsInDeptByManager.getAllBudgetRequestsInDeptByManager(dept.id);
      setSubBudgets(budgetsReadOnly);
    } catch (err) {
      console.error("Failed loading budget overview matrix:", err);
    }
  };

  const handleViewEmployees = async (dept) => {
    setActiveDept(dept);
    setSubWorkspaceMode('EMPLOYEES');
    try {
      // 🛠️ PLACEHOLDER: Fetch Staff Directory for this department
      // const res = await apiService.getEmployeesByDepartment(dept.id);
      // setSubEmployees(res.data);

      const viewEmployees = await viewAllEmployeesInDeptByManager.getAllEmployeesInDeptByManager(dept.id);
      setSubEmployees(viewEmployees);
    } catch (err) {
      console.error("Failed loading staff layout:", err);
    }
  };

  const handleCreateUser = async () => {
    if (!activeDept) return;
    setTargetFormRole('EMPLOYEE');
    setUserFormData({
      username: '',
      password: '',
      fullName: '',
      designation: '',
      role: 'ROLE_EMPLOYEE',
      departmentId: activeDept.id // bound explicitly to the selected department
    });
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (empId) => {
    if (!window.confirm("Revoke user clearance and delete account profile?")) return;

    try {
      setActionLoadingId(`del-emp-${empId}`);
      // 🛠️ PLACEHOLDER: Call Employee Deletion API Endpoint
      // await apiService.deleteEmployee(empId);

      await deleteUserOrManager.ByAdmin(empId);

      setSubEmployees(prev => prev.filter(e => e.id !== empId));

      setSubBudgets(prev => prev.filter(req => req.userId !== empId && req.applicantId !== empId));
      alert("Employee deleted successfully.");
    } catch (err) {
      console.error("Could not execute account revocation:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 1. Triggered when clicking "Reassign / Update Manager" from the card matrix
  const handleUpdateDeptManager = (dept) => {
    setSelectedDeptToReassign(dept);
    // Pre-fill with the current manager if it exists, or leave empty
    setChosenManagerId(dept.managerId || '');
    setIsAssignModalOpen(true);
  };

  // 2. Form Submission Handler for the Modal
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeptToReassign || !chosenManagerId) return;

    try {
      setActionLoadingId(`assign-mgr-${selectedDeptToReassign.id}`);

      // Call Axios passing path variable and the body object
      await updateManagerOfDept.ByAdmin(selectedDeptToReassign.id, parseInt(chosenManagerId));

      // Find the full manager object to get their name for an accurate frontend update
      const newManagerObj = managersList.find(m => m.id === parseInt(chosenManagerId));
      const newManagerName = newManagerObj ? newManagerObj.fullName : 'Assigned Manager';

      // Update global state matrix to change the text instantly on the dashboard card
      setGlobalDepartments(prev =>
        prev.map(dept =>
          dept.id === selectedDeptToReassign.id
            ? { ...dept, managerId: parseInt(chosenManagerId), managerName: newManagerName }
            : dept
        )
      );

      alert(`Department manager successfully updated for ${selectedDeptToReassign.name}`);
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error("Manager assignment update rejected:", err);
      alert("Failed to reassign manager ownership.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFormSubmitUserAndManager = async (e) => {
    e.preventDefault();

    try {
      setActionLoadingId('submitting-form');

      // 🛠️ PLACEHOLDER: Call your backend creation endpoint passing the DTO
      // const res = await apiService.createUserProfile(userFormData);
      const newManagerOrEmployee = await createUserOrManager.ByAdmin(userFormData);


      // Optimistic UI updates based on the role created
      if (targetFormRole === 'MANAGER') {
        setManagersList(prev => [...prev, newManagerOrEmployee]);
        alert(`Successfully provisioned Manager account: ${newManagerOrEmployee.fullName}`);
      } else {
        setSubEmployees(prev => [...prev, newManagerOrEmployee]);
        alert(`Successfully provisioned Employee account: ${newManagerOrEmployee.fullName}`);
      }

      // Reset and close modal layout
      setIsUserModalOpen(false);
    } catch (err) {
      console.error("Account provisioning pipeline rejected:", err);
      alert("Failed to create profile. Ensure username is completely unique.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeptFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoadingId('submitting-dept');

      // Convert maxBudget string explicitly to a number for your Spring Boot backend
      const payload = {
        ...deptFormData,
        maxBudget: parseFloat(deptFormData.maxBudget)
      };

      // 🛠️ PLACEHOLDER: Handshake with your Spring Boot service
      // const res = await apiService.createDepartment(payload);


      const newDepartment = await createDepartment.ByAdmin(payload);

      setSubDepartments(prev => [...prev, newDepartment]);
      setGlobalDepartments(prev => [...prev, newDepartment]);

      alert(`Successfully established department: ${newDepartment.name}`);
      setIsDeptModalOpen(false);
    } catch (err) {
      console.error("Department creation pipeline rejected:", err);
      alert("Failed to create department profile.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ────────────────────────────────────────────────────────
  // 4. RENDERING ENGINE SUBORDINATES
  // ────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-6">
      {/* SECTION 1: ADMIN PROFILE BANNER CARD */}
      {adminDetails && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-9ad p-8 rounded-2xl text-white shadow-sm flex justify-between items-center">
          <div>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold tracking-wide uppercase border border-indigo-500/30">
              Chief HRM Control Environment
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-2">Welcome Back, {adminDetails?.fullName}</h1>
            <p className="text-md text-gray-800 mt-1 font-semibold">
              • Role: <span className="font-medium text-gray-700">{adminDetails?.designation}</span>
            </p>

          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => { setCurrentView('MANAGERS'); setActiveManager(null); setActiveDept(null); setSubWorkspaceMode(null); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentView === 'MANAGERS' ? 'bg-white text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              Manager Directory
            </button>
            <button
              onClick={() => { setCurrentView('GLOBAL_DEPTS'); setActiveManager(null); setActiveDept(null); setSubWorkspaceMode(null); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentView === 'GLOBAL_DEPTS' ? 'bg-white text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              Global Departments Matrix
            </button>
          </div>
        </div>
      )}

      {/* GLOBAL OPERATIONS CONTROL PANEL BAR */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="font-extrabold text-gray-800 text-lg tracking-tight">
          {currentView === 'MANAGERS' ? 'Corporate Management Directory' : 'Global Corporate Structuring'}
        </h2>
        {currentView === 'MANAGERS' && (
          <button
            onClick={handleCreateManager}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            + Provision New Manager
          </button>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────
          VIEW TYPE A: MANAGER CARDS GRID
          ──────────────────────────────────────────────────────── */}
      {currentView === 'MANAGERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managersList.map(manager => (
            <div key={manager.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
              <div>
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                    {manager.fullName.charAt(0)}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{manager.fullName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Role : {manager.designation}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex space-x-2">
                <button
                  onClick={() => handleViewManagerDepartments(manager)}
                  className={`flex-1 text-center font-bold text-xs py-2 rounded-xl transition-all border ${activeManager?.id === manager.id ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'}`}
                >
                  View Departments
                </button>
                <button
                  onClick={() => handleDeleteManager(manager.id)}
                  disabled={actionLoadingId === `del-mgr-${manager.id}`}
                  className={`px-3 py-2 rounded-xl font-bold text-xs border border-red-100 text-red-600 hover:bg-red-50 transition-all`}
                  title={"Delete Manager Profile"}
                >
                  {actionLoadingId === `del-mgr-${manager.id}` ? '...' : 'Delete'}
                </button>

                <button
                  onClick={() => handleOpenUpdateModal(manager)}
                  className="px-3 py-2 rounded-xl font-bold text-xs border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          VIEW TYPE B: GLOBAL ALL DEPARTMENTS MATRIX VIEW
          ──────────────────────────────────────────────────────── */}
      {currentView === 'GLOBAL_DEPTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {globalDepartments.map(dept => {
            const spent = dept.maxBudget - dept.remainingBudget;
            const pct = dept.maxBudget > 0 ? Math.min(100, (spent / dept.maxBudget) * 100) : 0;
            const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div key={dept.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{dept.name}</h3>
                </div>

                <p className="text-xs font-semibold text-gray-500 mb-4">
                  Manager: <span className="text-indigo-600">{dept.managerName || `Unassigned (ID: ${dept.managerId})`}</span>
                </p>

                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                  <div className={`${barColor} h-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-5">
                  <span>Spent: ${spent.toLocaleString()}</span>
                  <span>Limit: ${dept.maxBudget.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleUpdateDeptManager(dept)}
                  className="w-full text-center bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:text-indigo-600 text-gray-700 font-bold text-xs py-2 rounded-xl transition-all"
                >
                  Reassign / Update Manager
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          DYNAMIC DEPARTMENTS WORKSPACE UNDER SPECIFIC MANAGER
          ──────────────────────────────────────────────────────── */}
      {currentView === 'MANAGERS' && activeManager && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 mt-8">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Departments Managed by {activeManager.fullName}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Provision or manage structures assigned directly to this portfolio.</p>
            </div>
            <button
              onClick={handleCreateDepartment}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 font-bold text-xs px-3 py-2 rounded-xl transition-all"
            >
              + Create Department Under Manager
            </button>
          </div>

          {subDepartments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No active departments linked to this manager profile.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subDepartments.map(dept => (
                <div key={dept.id} className={`p-5 rounded-xl border transition-all ${activeDept?.id === dept.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-gray-100 bg-gray-50/50'}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 text-base">{dept.name}</h4>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="text-xs text-red-500 font-bold hover:text-red-700 transition-all"
                    >
                      Delete Dept
                    </button>
                  </div>

                  <div className="flex space-x-2 mt-6">
                    <button
                      onClick={() => handleViewBudgetsReadOnly(dept)}
                      className={`flex-1 text-center font-bold text-xs py-2 rounded-xl border transition-all ${activeDept?.id === dept.id && subWorkspaceMode === 'BUDGETS' ? 'bg-indigo-600 text-white border-transparent' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      View Budgets
                    </button>
                    <button
                      onClick={() => handleViewEmployees(dept)}
                      className={`flex-1 text-center font-bold text-xs py-2 rounded-xl border transition-all ${activeDept?.id === dept.id && subWorkspaceMode === 'EMPLOYEES' ? 'bg-indigo-600 text-white border-transparent' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      View Staff Directory
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          DYNAMIC DEPTS SUB-EXPLORER DATA WORKSPACE PANEL
          ──────────────────────────────────────────────────────── */}
      {activeDept && subWorkspaceMode && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-900 text-base">
                {activeDept.name} Workspace Matrix &rarr; <span className="text-indigo-600 capitalize font-medium">{subWorkspaceMode.toLowerCase()}</span>
              </h4>
            </div>
            {subWorkspaceMode === 'EMPLOYEES' && (
              <button
                onClick={handleCreateUser}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              >
                + Create & Assign Employee
              </button>
            )}
          </div>

          <div className="p-6">
            {/* SUB-PANEL TAB A: READ-ONLY BUDGET ALLOCATION TABLE */}
            {subWorkspaceMode === 'BUDGETS' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase tracking-wider bg-gray-50/70">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Requester</th>
                      <th className="px-6 py-3 font-semibold">Purpose Outline</th>
                      <th className="px-6 py-3 font-semibold text-right">Requested Funds</th>
                      <th className="px-6 py-3 font-semibold text-center">Status Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subBudgets.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">{req.employeeName}</td>
                        <td className="px-6 py-4 text-xs max-w-xs truncate">{req.description}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">${req.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 text-[10px] font-black tracking-wide rounded-full border ${req.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {subBudgets.length === 0 && (
                      <tr><td colSpan="4" className="text-center py-6 text-gray-400 text-xs">No budget records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* SUB-PANEL TAB B: ACTIVE STAFF DIRECTORY & MUTATION */}
            {subWorkspaceMode === 'EMPLOYEES' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase tracking-wider bg-gray-50/70">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Employe Name</th>
                      {/* <th className="px-6 py-3 font-semibold">Email Anchor</th> */}
                      <th className="px-6 py-3 font-semibold">Assigned Title</th>
                      <th className="px-6 py-3 font-semibold text-center">Clearance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900">{emp.fullName}</td>
                        {/* <td className="px-6 py-4 font-mono text-xs">{emp.email}</td> */}
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">{emp.designation}</td>
                        <td className="px-6 py-4 text-center space-x-3">
                          <button
                            onClick={() => handleOpenUpdateModal(emp)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteUser(emp.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition-all"
                          >
                            Terminate Account
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subEmployees.length === 0 && (
                      <tr><td colSpan="4" className="text-center py-6 text-gray-400 text-xs">This department has no assigned personnel.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>


        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          UNIFIED PROVISIONING FORM MODAL OVERLAY
          ──────────────────────────────────────────────────────── */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6">
              <h3 className="font-extrabold text-lg tracking-tight">
                {targetFormRole === 'MANAGER' ? 'Provision Corporate Manager' : `Add Employee to ${activeDept?.name}`}
              </h3>
              <p className="text-slate-400 text-xs mt-1">Fill out account credentials and operational access details.</p>
            </div>

            {/* Form Fields Wrapper */}
            <form onSubmit={handleFormSubmitUserAndManager} className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text" required
                  placeholder="e.g. John Doe"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Username</label>
                  <input
                    type="text" required
                    placeholder="johndoe12"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password" required
                    placeholder="••••••••"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Designation Title</label>
                <input
                  type="text" required
                  placeholder="e.g. Lead Analyst / Architect"
                  value={userFormData.designation}
                  onChange={(e) => setUserFormData(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="block font-bold text-gray-400 uppercase tracking-wide mb-0.5">Assigned Role</span>
                  <span className="font-mono font-bold text-indigo-600">{userFormData.role}</span>
                </div>
                <div>
                  <span className="block font-bold text-gray-400 uppercase tracking-wide mb-0.5">Department Context</span>
                  <span className="font-semibold text-gray-700 truncate block">
                    {targetFormRole === 'MANAGER' ? 'Global Portfolio' : activeDept?.name}
                  </span>
                </div>
              </div>

              {/* Action Operations Grid */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 text-center bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === 'submitting-form'}
                  className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {actionLoadingId === 'submitting-form' ? 'Processing...' : 'Save Profile'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          DEPARTMENT PROVISIONING FORM MODAL OVERLAY
          ──────────────────────────────────────────────────────── */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100">

            <div className="bg-slate-900 text-white p-6">
              <h3 className="font-extrabold text-lg tracking-tight">Create Corporate Department</h3>
              <p className="text-slate-400 text-xs mt-1">Establish a new budget portfolio domain under {activeManager?.name}.</p>
            </div>

            <form onSubmit={handleDeptFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Department Name</label>
                <input
                  type="text" required
                  placeholder="e.g. Cybersecurity & Analytics"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Max Budget Capacity ($)</label>
                <input
                  type="number" required min="1"
                  placeholder="e.g. 250000"
                  value={deptFormData.maxBudget}
                  onChange={(e) => setDeptFormData(prev => ({ ...prev, maxBudget: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="block font-bold text-gray-400 uppercase tracking-wide mb-0.5">Assigned Manager Owner</span>
                <span className="font-semibold text-gray-700 block">{activeManager?.name} <span className="text-gray-400 font-mono">(ID: {deptFormData.managerId})</span></span>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="flex-1 text-center bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === 'submitting-dept'}
                  className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {actionLoadingId === 'submitting-dept' ? 'Creating...' : 'Create Portfolio'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          MANAGER REASSIGNMENT SELECTION OVERLAY MODAL
          ──────────────────────────────────────────────────────── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100">

            <div className="bg-slate-900 text-white p-6">
              <h3 className="font-extrabold text-lg tracking-tight">Reassign Department Ownership</h3>
              <p className="text-slate-400 text-xs mt-1">Transfer structural command of <b>{selectedDeptToReassign?.name}</b>.</p>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select New Active Portfolio Manager
                </label>

                {/* Clean dropdown selection containing mapped items from state */}
                <select
                  required
                  value={chosenManagerId}
                  onChange={(e) => setChosenManagerId(e.target.value)}
                  className="w-full text-sm border border-gray-200 bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer"
                >
                  <option value="" disabled>-- Select a qualified manager profile --</option>
                  {managersList.map(mgr => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.fullName} (Clearance ID: {mgr.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 text-center bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === `assign-mgr-${selectedDeptToReassign?.id}`}
                  className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {actionLoadingId === `assign-mgr-${selectedDeptToReassign?.id}` ? 'Updating...' : 'Transfer Command'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          USER PROFILE UPDATING/CREDENTIAL MODAL OVERLAY
          ──────────────────────────────────────────────────────── */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 transform transition-all scale-100">

            <div className="bg-slate-900 text-white p-6">
              <h3 className="font-extrabold text-lg tracking-tight">Modify User Account</h3>
              <p className="text-slate-400 text-xs mt-1">
                Updating profile parameters for ID: <span className="font-mono text-indigo-300">{targetUpdateUser?.id}</span>
              </p>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text" required
                  placeholder="Update account display name"
                  value={updateFormData.fullName}
                  onChange={(e) => setUpdateFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Account Username</label>
                <input
                  type="text" required
                  placeholder="Update core login username"
                  value={updateFormData.username}
                  onChange={(e) => setUpdateFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Security Password <span className="text-gray-400 font-normal lowercase">(Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter a new secure password"
                  value={updateFormData.password}
                  onChange={(e) => setUpdateFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 text-center bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-sm py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === `update-user-${targetUpdateUser?.id}`}
                  className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {actionLoadingId === `update-user-${targetUpdateUser?.id}` ? 'Saving Changes...' : 'Commit Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}