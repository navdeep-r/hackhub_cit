import {
    BookOpen, Camera,
    Code,
    Coffee, Gamepad2,
    Heart, Music,
    Palette,
    Rocket, Star,
    Trophy,
    Zap
} from 'lucide-react';

export const AVATAR_MAP: Record<string, { icon: any, gradient: string }> = {
    'code-indigo': { icon: Code, gradient: 'from-indigo-500 to-purple-600' },
    'rocket-cyan': { icon: Rocket, gradient: 'from-cyan-500 to-blue-600' },
    'star-pink': { icon: Star, gradient: 'from-pink-500 to-rose-600' },
    'zap-yellow': { icon: Zap, gradient: 'from-yellow-500 to-orange-600' },
    'heart-red': { icon: Heart, gradient: 'from-red-500 to-pink-600' },
    'music-purple': { icon: Music, gradient: 'from-purple-500 to-indigo-600' },
    'palette-teal': { icon: Palette, gradient: 'from-teal-500 to-emerald-600' },
    'coffee-amber': { icon: Coffee, gradient: 'from-amber-500 to-orange-600' },
    'gamepad-violet': { icon: Gamepad2, gradient: 'from-violet-500 to-purple-600' },
    'book-emerald': { icon: BookOpen, gradient: 'from-emerald-500 to-teal-600' },
    'camera-sky': { icon: Camera, gradient: 'from-sky-500 to-cyan-600' },
    'trophy-gold': { icon: Trophy, gradient: 'from-yellow-500 to-amber-600' },
};

export type ResolvedAvatar =
    | { type: 'google'; src: string }
    | { type: 'preset'; icon: any; gradient: string };

export function resolveProfilePicture(user: {
    profilePicturePreset?: string;
    googleProfileImage?: string;
}): ResolvedAvatar {
    if (user.profilePicturePreset === 'google' && user.googleProfileImage) {
        return {
            type: 'google',
            src: user.googleProfileImage,
        };
    }

    const preset =
        AVATAR_MAP[user.profilePicturePreset ?? 'code-indigo'] ??
        AVATAR_MAP['code-indigo'];

    return {
        type: 'preset',
        icon: preset.icon,
        gradient: preset.gradient,
    };
}

export const AVATAR_PRESETS = Object.entries(AVATAR_MAP).map(
    ([id, value]) => ({
        id,
        icon: value.icon,
        gradient: value.gradient,
    })
);
