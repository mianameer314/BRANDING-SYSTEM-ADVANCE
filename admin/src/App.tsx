import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from 'react-hot-toast';

export function App() {
 return (
 <QueryProvider>
 <AuthProvider>
 <RouterProvider router={router} />
 <Toaster position="top-right" />
 </AuthProvider>
 </QueryProvider>
 );
}

export default App;
