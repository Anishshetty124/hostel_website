import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const result = await login(email, password);
        
        if (result.success) {
            // Check role from the response or context to redirect correctly
            // (The context usually updates a bit slower, so we use the result here if possible, 
            // but for safety we redirect to a generic dashboard or check localStorage)
            const userData = JSON.parse(localStorage.getItem('userInfo'));
            if(userData?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" value={email} required
                            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" value={password} required
                            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold">
                        Login
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    New here? <Link to="/register" className="text-blue-600 hover:underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;