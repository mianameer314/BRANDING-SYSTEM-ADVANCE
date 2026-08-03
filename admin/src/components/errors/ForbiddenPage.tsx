import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function ForbiddenPage() {
 const navigate = useNavigate();

 return (
 <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
 <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
 <ShieldAlert size={40} />
 </div>
 <h1 className="mt-6 text-3xl font-bold text-foreground">403 Forbidden</h1>
 <p className="mt-2 text-muted-foreground">
 You do not have permission to access this page.
 </p>
 
 <div className="mt-8 flex items-center gap-4">
 <button 
 onClick={() => navigate(-1)}
 className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
 >
 Go Back
 </button>
 <button 
 onClick={() => navigate('/dashboard')}
 className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-secondary transition hover:bg-primary"
 >
 Dashboard
 </button>
 </div>
 </div>
 );
}
