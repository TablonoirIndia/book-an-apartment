import axiosInstance from './axiosInstance'; 

const login = async (phoneNumber) => {
    const response = await axiosInstance.post('/api/login', { phoneNumber });
    const token = response.data.token;
    localStorage.setItem('token', token);
    return response;
};


const logout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found in localStorage');
        return;
    }

    try {
        const response = await axiosInstance.post('/api/logout', {}, {            
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest',
            },
            withCredentials: true,
        });
        
        localStorage.removeItem('token');  
        return response;      
        // window.location.href = '/';
    } catch (error) {
        console.error('Error during logout:', error.response ? error.response.data : error.message);
    }
};

const getUser = async (userId) => {
    const token = localStorage.getItem('token');  

    if (!token) {
        throw new Error('No token found');
    }
    const response = await axiosInstance.get(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export default { login, logout, getUser };
