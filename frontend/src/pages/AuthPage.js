import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export const AuthPage = () => {
  const [currentForm, setCurrentForm] = useState('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {currentForm === 'login' && <LoginForm onToggleForm={setCurrentForm} />}
      {currentForm === 'register' && <RegisterForm onToggleForm={setCurrentForm} />}
      {currentForm === 'forgot' && <ForgotPasswordForm onToggleForm={setCurrentForm} />}
    </div>
  );
};