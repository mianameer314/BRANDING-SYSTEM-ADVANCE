import { useState, useEffect, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useUpdateProfile, useChangePassword } from './hooks';
import axios from 'axios';
import { Mail, User, Lock, Eye, EyeOff, ArrowUpRight } from 'lucide-react';

function validatePassword(password: string): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/\d/.test(password)) return 'Password must contain at least one digit.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one symbol.';
    return null;
}

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { setHeaderState } = useOutletContext<any>();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [fullName, setFullName] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    setHeaderState({
      title: 'Profile Settings',
      subtitle: 'Manage your personal information.',
      showBackButton: false
    });
    
    if (user) {
      setFullName(user.full_name);
    }
  }, [user, setHeaderState]);

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    updateProfile(
      { full_name: fullName },
      {
        onSuccess: (updatedUser) => {
          setProfileSuccess('Profile updated successfully!');
          updateUser(updatedUser);
        },
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const detail = err.response?.data?.detail;
            setProfileError(
              typeof detail === 'string'
                ? detail
                : 'Failed to update profile.'
            );
          } else {
            setProfileError('Something went wrong. Please try again.');
          }
        },
      }
    );
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setPasswordError(passwordError);
      return;
    }

    changePassword(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setPasswordSuccess('Password changed successfully! You will be logged out in a moment.');
          setTimeout(() => {
            logout();
            window.location.href = '/login';
          }, 3000);
        },
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const detail = err.response?.data?.detail;
            setPasswordError(
              typeof detail === 'string'
                ? detail
                : 'Failed to change password. Please check your current password.'
            );
          } else {
            setPasswordError('Something went wrong. Please try again.');
          }
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-5xl py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 flex flex-col h-full">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your basic profile details and preferences.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex-1 flex flex-col">
          <form onSubmit={handleProfileSubmit} className="space-y-6 flex-1 flex flex-col">
            {/* Email (Read Only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full cursor-not-allowed rounded-lg border border-border bg-accent py-2.5 pl-10 pr-3.5 text-sm text-muted-foreground outline-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed after registration.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-border bg-accent py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Role (Read Only) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Role
              </label>
              <input
                type="text"
                disabled
                value={user?.role || ''}
                className="w-full cursor-not-allowed rounded-lg border border-border bg-accent py-2.5 px-3.5 text-sm capitalize text-muted-foreground outline-none"
              />
            </div>

            {/* Error & Success */}
            {profileError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                {profileSuccess}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border mt-auto">
              <button
                type="submit"
                disabled={isUpdating || fullName === user?.full_name}
                className="interactive-button-small disabled:opacity-50 disabled:pointer-events-none"
              >
                {isUpdating ? (
                  <span className="label flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Saving…
                  </span>
                ) : (
                  <>
                    <ArrowUpRight className="icon w-5 h-5" />
                    <span className="label">Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-6 flex flex-col h-full">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Security</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your account password. You will be logged out after changing it.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex-1 flex flex-col">
          <form onSubmit={handlePasswordSubmit} className="space-y-6 flex-1 flex flex-col">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">
                Current Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-accent py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
                New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-accent py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-accent py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error & Success */}
            {passwordError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                {passwordSuccess}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border mt-auto">
              <button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="interactive-button-small disabled:opacity-50 disabled:pointer-events-none"
              >
                {isChangingPassword ? (
                  <span className="label flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Updating…
                  </span>
                ) : (
                  <>
                    <ArrowUpRight className="icon w-5 h-5" />
                    <span className="label">Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>

    </div>
  );
}
