import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, Save, Loader2, Mail, Building, Calendar, Hash, User as UserIcon } from 'lucide-react';
import { updateUserProfile } from '../services/api';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdateUser: (user: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({
        name: user.name,
        department: user.department || '',
        year: user.year || '',
        registerNo: user.registerNo || '',
        bio: user.bio || '',
        skills: user.skills || []
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatedUser = await updateUserProfile(user.id, formData);
            onUpdateUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserIcon className="text-indigo-400" /> Profile
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Column: Image & Basic Info */}
                        <div className="flex flex-col items-center gap-4 md:w-1/3">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 shadow-xl">
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
                                        <UserIcon size={48} />
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${user.role === UserRole.FACULTY
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Right Column: Details Form */}
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                        <UserIcon size={14} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                        <Mail size={14} /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={user.email}
                                        className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                            <Building size={14} /> Department
                                        </label>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            placeholder="e.g. CSE"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                            <Calendar size={14} /> Year
                                        </label>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: e.target.value })}
                                            placeholder="e.g. III"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
                                        <Hash size={14} /> Register Number
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formData.registerNo}
                                        onChange={e => setFormData({ ...formData, registerNo: e.target.value })}
                                        className="w-full p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Bio</label>
                                    <textarea
                                        disabled={!isEditing}
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        rows={3}
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60 resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => { setIsEditing(false); setFormData({ name: user.name, department: user.department || '', year: user.year || '', registerNo: user.registerNo || '', bio: user.bio || '', skills: user.skills || [] }); }}
                                className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 border border-slate-700 transition-all"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
