import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useCreateUser, useUpdateUser } from './hooks';
import { FormField } from '@/components/form/FormField';
import { FormActions } from '@/components/form/FormActions';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';

const createUserSchema = z.object({
 full_name: z.string().min(2, 'Name is too short'),
 email: z.string().email('Invalid email address'),
 password: z.string().min(8, 'Password must be at least 8 characters'),
 role: z.enum(['super_admin', 'admin', 'editor', 'user', 'viewer']),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const updateUserSchema = z.object({
 full_name: z.string().min(2, 'Name is too short'),
 role: z.enum(['super_admin', 'admin', 'editor', 'user', 'viewer']),
});

export function UserFormPage() {
 const { id } = useParams<{ id: string }>();
 const isEdit = Boolean(id);
 const navigate = useNavigate();
 const { user: currentUser } = useAuth();

 const isSelf = isEdit && currentUser?.id === Number(id);

 const { data: existingUser, isLoading: isLoadingUser, isError } = useUser(
 isEdit ? Number(id) : 0
 );

 const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
 const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

 const schema = isEdit ? updateUserSchema : createUserSchema;

 const {
 register,
 handleSubmit,
 control,
 reset,
 formState: { errors, isDirty },
 } = useForm<CreateUserFormValues>({
 resolver: zodResolver(schema) as any,
 defaultValues: {
 full_name: '',
 email: '',
 password: '',
 role: 'user',
 },
 });

 useEffect(() => {
 if (isEdit && existingUser) {
 reset({
 full_name: existingUser.full_name,
 role: existingUser.role,
 });
 }
 }, [isEdit, existingUser, reset]);

 const onSubmit = async (data: any) => {
 try {
 if (isEdit) {
 await updateUser({ id: Number(id), data });
 toast.success('User updated successfully');
 navigate('/users');
 } else {
 await createUser(data);
 toast.success('User created successfully');
 navigate('/users');
 }
 } catch (err: any) {
 toast.error(err?.response?.data?.detail ?? 'Failed to save user');
 }
 };

 const isLoading = isLoadingUser || isCreating || isUpdating;

 if (isEdit && isLoadingUser) return <LoadingState />;
 if (isEdit && isError) return <ErrorState />;

 return (
 <div className="mx-auto max-w-2xl space-y-6">
 <div className="flex items-center gap-4">
 <Link
 to="/users"
 className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground duration-200 active:scale-90"
 >
 <ArrowLeft size={16} />
 </Link>
 <div>
 <h2 className="text-xl font-semibold text-foreground">
 {isEdit ? 'Edit User' : 'Create User'}
 </h2>
 <p className="mt-0.5 text-sm text-muted-foreground">
 {isEdit ? 'Modify user details' : 'Add a new user to the system'}
 </p>
 </div>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
 <div className="rounded-xl border border-border bg-card p-6 space-y-4">
 <FormField
 label="Full Name"
 placeholder="John Doe"
 error={errors.full_name}
 {...register('full_name')}
 />

 {!isEdit && (
 <>
 <FormField
 label="Email"
 type="email"
 placeholder="john@example.com"
 error={errors.email}
 {...register('email')}
 />
 <FormField
 label="Password"
 type="password"
 placeholder="••••••••"
 error={errors.password}
 {...register('password')}
 />
 </>
 )}

 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-medium text-foreground">Role</label>
 <Controller
 name="role"
 control={control}
 render={({ field }) => (
 <select
 value={field.value}
 onChange={field.onChange}
 disabled={isSelf}
 className={[
 'rounded-lg border bg-input px-3 py-2 text-sm text-foreground outline-none',
 'transition-colors cursor-pointer',
 'focus:border-primary focus:ring-1 focus:ring-primary',
 errors.role ? 'border-destructive/30' : 'border-border',
 isSelf ? 'cursor-not-allowed opacity-50' : '',
 ]
 .filter(Boolean)
 .join(' ')}
 >
 <option value="viewer">Viewer</option>
 <option value="user">User</option>
 <option value="editor">Editor</option>
 <option value="admin">Admin</option>
 <option value="super_admin">Super Admin</option>
 </select>
 )}
 />
 {errors.role && <p className="text-xs text-destructive">{errors.role.message as string}</p>}
 {isSelf && <p className="text-xs text-warning">You cannot change your own role.</p>}
 </div>
 </div>

 <FormActions
 isLoading={isLoading}
 isDirty={isDirty}
 isEdit={isEdit}
 cancelTo="/users"
 />
 </form>
 </div>
 );
}
