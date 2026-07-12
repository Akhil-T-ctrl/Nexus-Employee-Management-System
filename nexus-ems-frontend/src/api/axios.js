import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const logInWithCredentials = {
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);

    return response.data; // Return just the DTO data directly
  }
};

// Employee / User Services
export const viewTheEmployeeDetails = {
  getProfile: async (employeeId) => {
    const response = await API.get('/employee/view', {
      params: { employeeId: employeeId }
    });
    return response.data;
  }
};

export const createBudgetRequest = {
  createRequest: async (requestData, employeeId) => {
    // This will POST to http://localhost:8080/api/budget/create (or your exact backend endpoint)
    const response = await API.post('/budget/submit', requestData, {
      params: { employeeId: employeeId }
    });
    return response.data;
  }
};

export const viewEmployeeBudgetRequests = {
  getRequestsByEmployee: async (employeeId) => {
    const response = await API.get('/budget/my-requests', {
      params: { employeeId: employeeId }
    });
    return response.data; // Returns just the Array of budgets
  }
};

export const viewDepartmentsByManager = {
  getDepartmentsByManager: async (managerId) => {
    const response = await API.get('/manager/departments', {
      params: { managerId: managerId }
    });
    return response.data;
  }
};

export const viewAllEmployeesInDeptByManager = {
  getAllEmployeesInDeptByManager: async (departmentId) => {
    const response = await API.get('/manager/users', {
      params: { departmentId: departmentId }
    });
    return response.data;
  }
};

export const viewAllBudgetRequestsInDeptByManager = {
  getAllBudgetRequestsInDeptByManager: async (departmentId) => {
    const response = await API.get('/manager/budgets/department', {
      params: { departmentId: departmentId }
    });
    return response.data;
  }
};

export const updateStatusOfBudget = {
  updateStatusOfBudgetByManager: async (requestId, status) => {
    const response = await API.put(`/budget/manage/review/${requestId}`, null, {
      params: { status: status }
    });
    return response.data;
  }
};

export const viewAllManagers = {
  ByAdmin: async () => {
    const response = await API.get('/admin/managers');
    return response.data;
  }
};

export const viewAllDepartments = {
  ByAdmin: async () => {
    const response = await API.get('/admin/departments');
    return response.data;
  }
};

export const createUserOrManager = {
  ByAdmin: async (registerDto) => {
    const response = await API.post('/admin/register-user', registerDto);
    return response.data;
  }
};

export const deleteUserOrManager = {
  ByAdmin: async (userOrmanagerId) => {
    const response = await API.delete(`/admin/users/${userOrmanagerId}`);
    return response.data;
  }
};

export const createDepartment = {
  ByAdmin: async (departmentBody) => {
    const response = await API.post('/admin/departments', departmentBody);
    return response.data;
  }
};

export const deleteDepartment = {
  ByAdmin: async (departmentId) => {
    const response = await API.delete('/admin/departments', {
      params: {
        departmentId: departmentId
      }
    });
    return response.data;
  }
};

export const updateManagerOfDept = {
  ByAdmin: async (departmentId, newManagerId) => {
    const response = await API.put(`/admin/departments/${departmentId}/manager`, {
      newManagerId: newManagerId
    });
    return response.data;
  }
};

export const updateUserOrManager = {
  ByAdmin: async (userId, updateDto) => {
    const response = await API.put('/admin/users', updateDto, {
      params: {
        employeeId: userId
      }
    });
    return response.data;
  }
};






