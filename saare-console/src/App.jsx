import React from 'react';
import { AuthProvider } from './context/AuthContext';
import OperationCenter from './pages/OperationCenter';

export default function App() {
  return (
    <AuthProvider>
      <OperationCenter />
    </AuthProvider>
  );
}
