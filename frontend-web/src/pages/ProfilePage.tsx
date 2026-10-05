import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { UpdateProfileDTO } from '../types/auth';

export function ProfilePage() {
    const { user, updateProfile, isLoading, error: contextError } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [touched, setTouched] = useState({
        displayName: false,
        email: false,
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const displayNameError =
        touched.displayName && (!displayName ? 'Name is required' : displayName.length < 2 ? 'Name must be at least 2 characters' : '');
    const emailError = touched.email && (!email ? 'Email is required' : !isValidEmail(email) ? 'Invalid email' : '');
    const passwordError =
        touched.newPassword && newPassword && newPassword.length < 6 ? 'Password must be at least 6 characters' : '';
    const confirmPasswordError =
        touched.confirmPassword && confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : '';

    const hasChanges =
        displayName !== user?.displayName ||
        email !== user?.email ||
        currentPassword ||
        newPassword;

    const canSubmit =
        hasChanges &&
        !displayNameError &&
        !emailError &&
        !passwordError &&
        !confirmPasswordError &&
        !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const updateData: UpdateProfileDTO = {};

            if (displayName !== user?.displayName) {
                updateData.displayName = displayName;
            }
            if (email !== user?.email) {
                updateData.email = email;
            }
            if (newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            await updateProfile(updateData);
            setSuccess('Profile updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Update failed');
        }
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f5ede6] py-8 px-4 sm:px-6">
            <div className="mx-auto max-w-2xl">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-[#151414] mb-2">My Profile</h1>
                    <p className="text-neutral-500 mb-8">Manage your account settings</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Account Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-[#151414] mb-4">Account Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#151414] mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, displayName: true })}
                                        placeholder="Your name"
                                        className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                                            displayNameError ? 'border-red-500 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                                        } text-[#151414] placeholder:text-neutral-400 focus:outline-none focus:border-[#4287f5]`}
                                    />
                                    {displayNameError && <p className="text-red-600 text-xs mt-1">{displayNameError}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#151414] mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, email: true })}
                                        placeholder="you@example.com"
                                        className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                                            emailError ? 'border-red-500 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                                        } text-[#151414] placeholder:text-neutral-400 focus:outline-none focus:border-[#4287f5]`}
                                    />
                                    {emailError && <p className="text-red-600 text-xs mt-1">{emailError}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="border-t border-neutral-200 pt-6">
                            <h2 className="text-lg font-semibold text-[#151414] mb-4">Change Password</h2>
                            <p className="text-neutral-500 text-sm mb-4">Leave empty if you don't want to change your password</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#151414] mb-1.5">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, currentPassword: true })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 bg-white hover:border-neutral-400 text-[#151414] placeholder:text-neutral-400 focus:outline-none focus:border-[#4287f5] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#151414] mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, newPassword: true })}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                                            passwordError ? 'border-red-500 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                                        } text-[#151414] placeholder:text-neutral-400 focus:outline-none focus:border-[#4287f5]`}
                                    />
                                    {passwordError && <p className="text-red-600 text-xs mt-1">{passwordError}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#151414] mb-1.5">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                                            confirmPasswordError ? 'border-red-500 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                                        } text-[#151414] placeholder:text-neutral-400 focus:outline-none focus:border-[#4287f5]`}
                                    />
                                    {confirmPasswordError && <p className="text-red-600 text-xs mt-1">{confirmPasswordError}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {(error || contextError) && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error || contextError}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 text-sm">{success}</p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                    canSubmit
                                        ? 'bg-[#4287f5] text-white hover:bg-[#3073e6] active:scale-95 cursor-pointer'
                                        : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-2.5 rounded-lg font-medium bg-neutral-200 text-[#151414] hover:bg-neutral-300 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>

                    {/* User Info */}
                    <div className="mt-8 pt-8 border-t border-neutral-200">
                        <h3 className="text-sm font-medium text-[#151414] mb-4">Account Details</h3>
                        <div className="space-y-2 text-sm text-neutral-600">
                            <p>
                                <span className="font-medium text-[#151414]">User ID:</span> {user.id}
                            </p>
                            {user.createdAt && (
                                <p>
                                    <span className="font-medium text-[#151414]">Member since:</span>{' '}
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            )}
                            {user.updatedAt && (
                                <p>
                                    <span className="font-medium text-[#151414]">Last updated:</span>{' '}
                                    {new Date(user.updatedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
