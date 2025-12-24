import { jwtDecode } from "jwt-decode";
import {
    AlertCircle,
    ArrowRight,
    Eye,
    EyeOff,
    GraduationCap,
    Hash,
    Key,
    Lock,
    Mail,
    Shield,
    User as UserIcon,
} from "lucide-react";
import React, { useState } from "react";
import { UserRole } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const DEPARTMENTS = ["CSE"];
const YEARS = ["I", "II", "III", "IV"];

const getSectionsForDepartment = (department: string): string[] => {
    if (department === "CSE") {
        return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"];
    }
    return ["A"];
};

type SignupTokenPayload = {
    email: string;
    name?: string;
};

export const CompleteSignup: React.FC = () => {
    const hash = window.location.hash;
    const query = hash.includes("?") ? hash.split("?")[1] : "";
    const signupToken = new URLSearchParams(query).get("token");

    if (!signupToken) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                Invalid or expired signup link.
            </div>
        );
    }

    const decoded = jwtDecode<SignupTokenPayload>(signupToken);

    const [activeRole, setActiveRole] = useState<UserRole>(UserRole.STUDENT);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: decoded.name || "",
        email: decoded.email || "",
        password: "",
        department: "CSE",
        year: "I",
        section: "A",
        registerNo: "",
        secretCode: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "department") {
            const sections = getSectionsForDepartment(value);
            setFormData((p) => ({
                ...p,
                department: value,
                section: sections.includes(p.section) ? p.section : "A",
            }));
        } else {
            setFormData((p) => ({ ...p, [name]: value }));
        }

        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            setIsLoading(true);

            const payload: any = {
                signupToken,
                role: activeRole,
                name: formData.name,
                email: formData.email,
                password: formData.password,
            };

            if (activeRole === UserRole.STUDENT) {
                payload.department = formData.department;
                payload.year = formData.year;
                payload.section = formData.section;
                payload.registerNo = formData.registerNo;
            }

            if (activeRole === UserRole.FACULTY) {
                payload.secretCode = formData.secretCode;
            }

            const res = await fetch(`${API_BASE}/auth/google/complete-signup`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Signup failed");
                return;
            }

            window.location.href = '/';
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = () => {
        setActiveRole(activeRole == UserRole.FACULTY ? UserRole.STUDENT : UserRole.FACULTY)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md glass-panel p-6 rounded-2xl">

                <h1 className="text-2xl font-bold text-center mb-1">
                    Complete Signup
                </h1>
                <p className="text-slate-400 text-sm text-center mb-6">
                    Google verified your email — finish creating your account
                </p>

                {/* ROLE TOGGLE — OPTION B (FIXED & MATCHES ORIGINAL SCALE) */}
                <div className="mb-6">
                    <div className="relative grid grid-cols-2 p-1 bg-slate-950/50 rounded-xl">

                        {/* Sliding Indicator */}
                        <div
                            className={`
    absolute
    top-1.5 bottom-1.5
    left-1.5
    w-[calc(50%-6px)]
    rounded-lg
    transition-transform duration-300 ease-out
    ${activeRole === UserRole.STUDENT
                                    ? "translate-x-0 bg-gradient-to-r from-cyan-600 to-blue-600"
                                    : "translate-x-full bg-gradient-to-r from-indigo-600 to-purple-600"}
  `}
                            style={{ zIndex: 0 }}
                        />


                        {/* Student */}
                        <button
                            type="button"
                            onClick={handleToggle}
                            className={`
        relative z-10 py-3 px-6 rounded-lg
        font-bold text-sm
        transition-colors duration-200
        flex items-center justify-center gap-2
        ${activeRole === UserRole.STUDENT
                                    ? "text-white"
                                    : "text-slate-400 hover:text-white"}
      `}
                        >
                            <GraduationCap size={14} />
                            Student
                        </button>

                        {/* Faculty */}
                        <button
                            type="button"
                            onClick={handleToggle}
                            className={`
        relative z-10 py-3 px-6 rounded-lg
        font-bold text-sm
        transition-colors duration-200
        flex items-center justify-center gap-2
        ${activeRole === UserRole.FACULTY
                                    ? "text-white"
                                    : "text-slate-400 hover:text-white"}
      `}
                        >
                            <Shield size={14} />
                            Faculty
                        </button>

                    </div>
                </div>


                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* NAME */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">
                            Full Name
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 py-3 rounded-xl bg-slate-950 border border-slate-800"
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase">
                            Email (verified by Google)
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                value={formData.email}
                                disabled
                                className="w-full pl-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                            Password
                            {!formData.password && (
                                <span className="text-[10px] text-red-400 flex items-center gap-1">
                                    <AlertCircle size={10} /> Required
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* STUDENT FIELDS */}
                    {activeRole === UserRole.STUDENT && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">
                                        Dept.
                                    </label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 appearance-none"
                                    >
                                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">
                                        Year
                                    </label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 appearance-none"
                                    >
                                        {YEARS.map(y => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">
                                        Section
                                    </label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 appearance-none"
                                    >
                                        {getSectionsForDepartment(formData.department).map(s => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                                        Register No.
                                        {!formData.registerNo ? (
                                            <span className="text-[10px] text-red-400 flex items-center gap-1">
                                                <AlertCircle size={10} /> Required
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-orange-400 flex items-center gap-1">
                                                <AlertCircle size={10} /> Permanent
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            name="registerNo"
                                            value={formData.registerNo}
                                            onChange={handleChange}
                                            placeholder="24CS001"
                                            className="w-full pl-10 py-3 rounded-xl bg-slate-950 border border-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* FACULTY FIELD */}
                    {activeRole === UserRole.FACULTY && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                                Faculty Secret Code
                                <span className="text-[10px] text-purple-400 flex items-center gap-1">
                                    <AlertCircle size={10} /> Authorized only
                                </span>
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    name="secretCode"
                                    type="password"
                                    value={formData.secretCode}
                                    onChange={handleChange}
                                    className="w-full pl-10 py-3 rounded-xl bg-slate-950 border border-slate-800"
                                />
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    {/* CREATE ACCOUNT BUTTON */}
                    <button
                        type="submit"
                        disabled={
                            isLoading ||
                            !formData.name ||
                            !formData.password ||
                            (activeRole === UserRole.STUDENT &&
                                (!formData.registerNo || !formData.section || !formData.year)) ||
                            (activeRole === UserRole.FACULTY && !formData.secretCode)
                        }
                        className="
              w-full
              py-3.5
              mt-2
              rounded-xl
              font-bold
              text-white
              shadow-lg
              flex items-center justify-center gap-2
              transition-all duration-300
              bg-gradient-to-r from-blue-600 to-cyan-600
              hover:scale-[1.02]
              active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
            "
                    >
                        {isLoading ? "Creating..." : <>Create Account <ArrowRight size={18} /></>}
                    </button>

                </form>
            </div>
        </div>
    );
};
