import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roomNumber: '' // Optional: User claims their room here
    });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext); // Auto-login after register
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. Register
            await axios.post('http://localhost:5000/api/auth/register', formData);
            
            // 2. Auto Login
            const loginResult = await login(formData.email, formData.password);
            
            if (loginResult.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Join HostelLife</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            name="name" type="text" required 
                            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            name="email" type="email" required 
                            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            name="password" type="password" required 
                            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Room Number (Optional)</label>
                        <input 
                            name="roomNumber" type="text" placeholder="e.g. A-101"
                            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={handleChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter to verify hostel membership.</p>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold">
                        Create Account
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;