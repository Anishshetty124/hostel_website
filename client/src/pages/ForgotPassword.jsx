import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../utils/api";
import Logo from "../assets/logo.svg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      setStatus({ loading: false, error: null, success: response.data.message });
      setStep(2);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to send reset code";
      setStatus({ 
        loading: false, 
        error: errMsg, 
        success: null 
      });
      // Log error to browser console
      console.error("[ForgotPassword] Error sending reset code:", error, errMsg);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      const response = await api.post("/api/auth/verify-reset-code", { 
        email, 
        code: resetCode 
      });
      setStatus({ loading: false, error: null, success: response.data.message });
      setStep(3);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Invalid or expired code";
      setStatus({ 
        loading: false, 
        error: errMsg, 
        success: null 
      });
      // Log error to browser console
      console.error("[ForgotPassword] Error verifying code:", error, errMsg);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ loading: false, error: "Passwords do not match", success: null });
      console.error("[ForgotPassword] Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setStatus({ 
        loading: false, 
        error: "Password must be at least 6 characters, contain 1 capital letter and 1 special character", 
        success: null 
      });
      console.error("[ForgotPassword] Password does not meet requirements");
      return;
    }

    setStatus({ loading: true, error: null, success: null });
    try {
      const response = await api.post("/api/auth/reset-password", { 
        email, 
        code: resetCode, 
        newPassword 
      });
      setStatus({ loading: false, error: null, success: response.data.message });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to reset password";
      setStatus({ 
        loading: false, 
        error: errMsg, 
        success: null 
      });
      // Log error to browser console
      console.error("[ForgotPassword] Error resetting password:", error, errMsg);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-10 transition-colors duration-300">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800/50 shadow-2xl">
        {/* Brand / Visual Panel */}
        <div className="relative hidden md:flex bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 dark:from-indigo-600 dark:via-indigo-700 dark:to-purple-900 items-center justify-center p-10 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white_2px,transparent_2px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl"></div>
          <div className="relative flex flex-col items-center text-white text-center gap-4 z-10">
            <img src={Logo} alt="myHostel" className="h-16 w-16 drop-shadow-xl" />
            <h2 className="text-3xl font-semibold tracking-tight">Password Recovery</h2>
            <p className="text-white/80 text-sm max-w-sm">Don't worry! We'll help you get back into your account.</p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm p-8 md:p-12 flex flex-col justify-center">
          <button 
            onClick={() => navigate('/user/dashboard')}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </button>

          <div className="mt-6 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
              {step === 1 && "Reset Your Password"}
              {step === 2 && "Verify Code"}
              {step === 3 && "Create New Password"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {step === 1 && "Enter your email to receive a reset code"}
              {step === 2 && "Enter the 6-digit code sent to your email"}
              {step === 3 && "Choose a strong new password"}
            </p>
          </div>

          {status.error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm text-center font-medium flex items-center gap-2 justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {status.error}
            </div>
          )}

          {status.success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-xl text-green-600 dark:text-green-400 text-sm text-center font-medium flex items-center gap-2 justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {status.success}
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div className="group">
                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-indigo-50/30 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg ${
                  status.loading ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                {status.loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="group">
                <label htmlFor="code" className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-indigo-50/30 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-xl px-4 py-3.5 text-center text-2xl tracking-widest font-mono text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg ${
                  status.loading ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                {status.loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Resend Code
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="group">
                <label htmlFor="newPassword" className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 pr-12 py-3.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-900/40 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="group">
                <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-900/40 transition-all duration-200"
                />
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                Password must contain:
                <ul className="mt-1 ml-4 list-disc">
                  <li>At least 6 characters</li>
                  <li>1 capital letter</li>
                  <li>1 special character (!@#$&*)</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg ${
                  status.loading ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                {status.loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
