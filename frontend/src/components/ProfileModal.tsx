import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, Save, Loader2, Mail, Building, Calendar, Hash, User as UserIcon, Code, Rocket, Star, Zap, Heart, Music, Palette, Coffee, Gamepad2, BookOpen, Camera, Trophy } from 'lucide-react';
import { updateUserProfile } from '../services/api';

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV == "production";
const SHOW_LOGS = (!isProduction) || process.env.SHOW_LOGS == '1';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdateUser: (user: User) => void;
}

// Avatar options with gradient backgrounds
const AVATAR_OPTIONS = [
    { id: 'code-indigo', icon: Code, gradient: 'from-indigo-500 to-purple-600' },
    { id: 'rocket-cyan', icon: Rocket, gradient: 'from-cyan-500 to-blue-600' },
    { id: 'star-pink', icon: Star, gradient: 'from-pink-500 to-rose-600' },
    { id: 'zap-yellow', icon: Zap, gradient: 'from-yellow-500 to-orange-600' },
    { id: 'heart-red', icon: Heart, gradient: 'from-red-500 to-pink-600' },
    { id: 'music-purple', icon: Music, gradient: 'from-purple-500 to-indigo-600' },
    { id: 'palette-teal', icon: Palette, gradient: 'from-teal-500 to-emerald-600' },
    { id: 'coffee-amber', icon: Coffee, gradient: 'from-amber-500 to-orange-600' },
    { id: 'gamepad-violet', icon: Gamepad2, gradient: 'from-violet-500 to-purple-600' },
    { id: 'book-emerald', icon: BookOpen, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'camera-sky', icon: Camera, gradient: 'from-sky-500 to-cyan-600' },
    { id: 'trophy-gold', icon: Trophy, gradient: 'from-yellow-500 to-amber-600' },
];

const getAvatarConfig = (avatarId?: string) => {
    return AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({
        name: user.name,
        department: user.department || '',
        year: user.year || '',
        registerNo: user.registerNo || '',
        bio: user.bio || '',
        skills: user.skills || [],
        profilePicture: user.profilePicture || 'code-indigo'
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Handle both id and _id (MongoDB uses _id)
            const userId = user.id || (user as any)._id;
            if (!userId) {
                throw new Error('User ID is missing');
            }
            const updatedUser = await updateUserProfile(userId, formData);
            onUpdateUser(updatedUser);
            setIsEditing(false);
        } catch (error: any) {
            SHOW_LOGS && console.error('Failed to update profile:', error);
            alert(`Failed to update profile: ${error.message || 'Unknown error'}.`);
        } finally {
            setIsLoading(false);
        }
    };

    const currentAvatar = getAvatarConfig(formData.profilePicture);
    const AvatarIcon = currentAvatar.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
                        {/* Left Column: Avatar & Basic Info */}
                        <div className="flex flex-col items-center gap-4 md:w-1/3">
                            <div className="relative group">
                                <div className={`w-32 h-32 rounded-2xl overflow-hidden border-4 ${isEditing ? 'border-indigo-500/50' : 'border-slate-800'} bg-gradient-to-br ${currentAvatar.gradient} shadow-xl flex items-center justify-center transition-all`}>
                                    <AvatarIcon size={56} className="text-white drop-shadow-lg" />
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

                            {/* Avatar Selection */}
                            {isEditing && (
                                <div className="w-full mt-4">
                                    <label className="block text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">
                                        Choose Avatar
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {AVATAR_OPTIONS.map((avatar) => {
                                            const Icon = avatar.icon;
                                            const isSelected = formData.profilePicture === avatar.id;
                                            return (
                                                <button
                                                    key={avatar.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, profilePicture: avatar.id })}
                                                    className={`relative h-16 rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center transition-all cursor-pointer
                                                        ${isSelected
                                                            ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-105 shadow-lg shadow-cyan-500/50'
                                                            : 'hover:scale-105 hover:shadow-lg opacity-80 hover:opacity-100'
                                                        }`}
                                                >
                                                    <Icon size={28} className="text-white drop-shadow-lg" />
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        name: user.name,
                                        department: user.department || '',
                                        year: user.year || '',
                                        registerNo: user.registerNo || '',
                                        bio: user.bio || '',
                                        skills: user.skills || [],
                                        profilePicture: user.profilePicture || 'code-indigo'
                                    });
                                }}
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
