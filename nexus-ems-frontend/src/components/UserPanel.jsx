import { useEffect, useState } from 'react';
import {createBudgetRequest, viewTheEmployeeDetails, viewEmployeeBudgetRequests} from '../api/axios';

const UserPanel = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [budgetRequests, setBudgetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: ''
  });

  const refreshBudgetTableOnly = async () => {
    try {
      const freshBudgets = await viewEmployeeBudgetRequests.getRequestsByEmployee(userId);
      setBudgetRequests(freshBudgets); // Updates ONLY the table! Profile data stays untouched.
    } catch (err) {
      console.error("Failed to refresh budget segment:", err);
    }
  };

  // Initial Mounting Frame Loop
  useEffect(() => {
    let isMounted = true;

    const initializeUserDashboard = async () => {
      try {
        // No setLoading(true) needed here because loading is true by default!
        const [profileData, budgetData] = await Promise.all([
          viewTheEmployeeDetails.getProfile(userId),
          viewEmployeeBudgetRequests.getRequestsByEmployee(userId)
        ]);

        if (isMounted) {
          setUserData(profileData);
          setBudgetRequests(budgetData);
        }
      } catch (err) {
        console.error("Failed to initialize profile:", err);
        if (isMounted) {
          setError("Could not retrieve dashboard data from the server.");
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Done loading initial frame safely
        }
      }
    };

    if (userId) {
      initializeUserDashboard();
    }

    return () => {
      isMounted = false; // Cleanup to prevent memory leaks
    };
  }, [userId]); // Completely happy dependency array

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Assemble the strict 4-parameter Submission DTO your Spring Boot backend wants
      const requestPayload = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount), // Ensure number primitive, not text string
        departmentId: userData?.departmentId // Safely pulled behind the scenes from the active profile!
      };

      // POST payload directly to backend
      await createBudgetRequest.createRequest(requestPayload,userId);

      // Reset form variables and dismiss modal gracefully
      setFormData({ title: '', description: '', amount: '' });
      setIsModalOpen(false);

      // Re-trigger database sync to append the new row immediately
      await refreshBudgetTableOnly(); 
      
    } catch (err) {
      console.error("Budget submission failed:", err);
      alert("Failed to register budget request. Please verify backend connectivity.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500 font-medium">Synchronizing workspace terminal...</div>;
  if (error) return <div className="p-6 text-red-600 bg-red-50 m-4 rounded-xl border border-red-200">{error}</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{userData?.fullName}</h2>
          <p className="text-gray-500">{userData?.designation} • {userData?.departmentName}</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all duration-150"
        >
          + Create Budget Request
        </button>
      </div>

      {/* Budget Request Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">My Budget Requests</h3>
        {(!budgetRequests || budgetRequests.length === 0) ? (
          <p className="text-gray-400 text-sm py-4">No budget history found for this account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="pb-3 px-3">Title</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {budgetRequests.map(req => (
                  <tr key={req.id}>
                    <td className="py-3 px-3">{req.title}</td>
                    <td className="py-3 px-3">${req.amount}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">{req.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl transition-all border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">New Budget Request</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 text-xl font-medium"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Request Purpose / Title</label>
                <input 
                  type="text" name="title" required value={formData.title} onChange={handleInputChange}
                  placeholder="e.g., Office Hardware Supply Upgrade"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Required Funding Value ($)</label>
                <input 
                  type="number" name="amount" required step="0.01" min="1" value={formData.amount} onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Detailed Justification</label>
                <textarea 
                  name="description" required rows="3" value={formData.description} onChange={handleInputChange}
                  placeholder="Explain why this allocation should clear management review..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50 shadow-sm"
                >
                  {formLoading ? 'Processing...' : 'Submit to Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserPanel;