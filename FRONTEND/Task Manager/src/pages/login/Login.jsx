import React from 'react'
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import re from "../../assets/re.png"
import Main_image from "../../assets/Main_image.png"
import removed from "../../assets/removed.png"
const PRIMARY = "#4f46e5";
const PRIMARY_LIGHT = "#eef2ff";
const PRIMARY_MID = "#818cf8";
const PRIMARY_SOFT = "#c7d2fe";
const Icon = ({ d, size = 16, stroke = "currentColor", sw = 1.8, fill = "none", children, viewBox = "0 0 16 16" }) => (
    <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {d ? <path d={d} /> : children}
    </svg>
);
function SprintCard() {
    const bars = [
        { label: "Backend", pct: 78, color: "#6366f1" },
        { label: "Frontend", pct: 61, color: "#818cf8" },
        { label: "Infra", pct: 90, color: "#10b981" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -12, 0] }}
            transition={{
                opacity: { delay: 1.1, duration: 0.5 },
                y: { delay: 1.1, duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute right-[-10px] top-[30px] w-[190px] 
      backdrop-blur-xl bg-white/80 
      border border-indigo-100 
      rounded-2xl p-4 
      shadow-[0_10px_40px_rgba(79,70,229,0.15)]"
        >
            {/* Title */}
            <div className="text-[11px] font-semibold text-gray-800 mb-3 tracking-wide">
                Sprint 14 · 3d left
            </div>

            {/* Bars */}
            {bars.map((b) => (
                <div key={b.label} className="mb-3 last:mb-0">

                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-500">{b.label}</span>
                        <span className="font-semibold" style={{ color: b.color }}>
                            {b.pct}%
                        </span>
                    </div>

                    <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${b.pct}%` }}
                            transition={{ delay: 1.4, duration: 1 }}
                            className="h-full rounded-full"
                            style={{
                                background: `linear-gradient(90deg, ${b.color}, #a5b4fc)`,
                                boxShadow: `0 0 8px ${b.color}55`,
                            }}
                        />
                    </div>

                </div>
            ))}
        </motion.div>
    );
}
function CIPill() {
    const statuses = [
        "Tests passing · 24/24",
        "Build succeeded · 1m42s",
        "Deployed to staging",
    ];

    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => {
            setIdx((i) => (i + 1) % statuses.length);
        }, 2400);
        return () => clearInterval(t);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{
                opacity: { delay: 1.4, duration: 0.5 },
                y: {
                    delay: 1.4,
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
            }}
            className="absolute bottom-[40px] left-0 w-[200px]
      backdrop-blur-xl bg-white/80
      border border-indigo-100
      rounded-xl px-3 py-2
      shadow-[0_8px_30px_rgba(79,70,229,0.15)]"
        >
            <div className="flex items-center gap-2">

                {/* Animated status dot */}
                <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                />

                {/* Text animation */}
                <AnimatePresence mode="wait">
                    <motion.span
                        key={idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3 }}
                        className="text-[11px] text-gray-700 font-mono"
                    >
                        {statuses[idx]}
                    </motion.span>
                </AnimatePresence>

            </div>
        </motion.div>
    );
}

const Login = () => {
    const [emailFocused, setEmailFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [roleFocused, setRoleFocused] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");
    const [roleOpen, setRoleOpen] = useState(false);
    const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } } };
    return (
        <div className="min-h-screen bg-[#f0f0f5] flex items-center justify-center p-6 font-jakarta">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                exit={{ opacity: 0, scale: 0.97, y: 24 }}
                className="flex w-full max-w-215 min-h-155 bg-white rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(79,70,229,0.12),0_4px_16px_rgba(0,0,0,0.06)]"
            >
                <motion.div
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
                    initial="hidden"
                    animate="show"
                    className="flex-1 px-12 py-13 flex flex-col justify-center"
                >
                    <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 36 }}>
                        <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            style={{ width: 34, height: 34, background: PRIMARY, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            {/* logo svg baad me iccha ho to change karne ki sochenge */}
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3,12 3,7" /><polyline points="7,12 7,4" /><polyline points="11,12 11,9" /><polyline points="15,12 15,5" />
                            </svg>
                        </motion.div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 15, color: "#111827", letterSpacing: "-0.02em" }}>
                            Task<span style={{ color: PRIMARY }}>Flow</span>
                        </span>
                    </motion.div>

                    {/* headline */}
                    <motion.h1 variants={fadeUp} style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 6px", lineHeight: 1.2 }}>
                        Welcome back
                    </motion.h1>
                    <motion.p variants={fadeUp} style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 30px", lineHeight: 1.65, maxWidth: 290 }}>
                        Your team's Collaborative Partner.
                    </motion.p>
                    <motion.div variants={fadeUp}>
                        <div className='username mb-[14px]'>
                            <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-widest uppercase">
                                Username
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    className={`w-full px-3.5 py-3 pr-10 rounded-xl text-sm text-gray-900 outline-none transition-all duration-200 border-[1.5px] ${emailFocused
                                        ? "border-indigo-600 bg-white shadow-[0_0_0_3px_rgba(79,70,229,0.15)]"
                                        : "border-gray-200 bg-gray-50"
                                        }`} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 flex">
                                    {<Icon size={16} viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" rx="2" /><polyline points="1,4 8,9 15,4" /></Icon>}
                                </span>
                            </div>
                        </div>
                        {/* Password Field */}
                        <div className="mb-3.5">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-widest uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Enter your password"
                                    onFocus={() => setPassFocused(true)}
                                    onBlur={() => setPassFocused(false)}
                                    className={`w-full px-3.5 py-3 pr-10 rounded-xl text-sm text-gray-900 outline-none transition-all duration-200 border-[1.5px] ${passFocused
                                        ? "border-indigo-600 bg-white shadow-[0_0_0_3px_rgba(79,70,229,0.15)]"
                                        : "border-gray-200 bg-gray-50"
                                        }`}
                                />
                                {/* show/hide button — only on password */}
                                <button
                                    onClick={() => setShowPass(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 flex p-0"
                                >
                                    <Icon size={16} viewBox="0 0 16 16">
                                        {showPass
                                            ? <><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></>
                                            : <><path d="M13.4 13.4L2.6 2.6M6.2 6.3A2 2 0 0 0 9.7 9.8" /><path d="M1 8s1.5-2.5 4-4M10 4.5C11.7 5.4 13 7 13 7s-1.5 2.5-4 3.5" /></>
                                        }
                                    </Icon>
                                </button>
                            </div>
                        </div>
                        {/* Role Field */}

                        {/* Custom Select */}
                        <div className="mb-3.5">
                            <label className="block text-xs font-semibold text-gray-700 mb-2 tracking-widest uppercase">
                                Role
                            </label>
                            <div className="relative">
                                {/* trigger button */}
                                <button
                                    onClick={() => setRoleOpen(s => !s)}
                                    className={`w-full px-3.5 py-3 pr-10 rounded-xl text-sm text-left outline-none transition-all duration-200 border-[1.5px] cursor-pointer ${roleOpen
                                        ? "border-indigo-600 bg-white shadow-[0_0_0_3px_rgba(79,70,229,0.15)]"
                                        : "border-gray-200 bg-gray-50"
                                        } ${selectedRole ? "text-gray-900" : "text-gray-400"}`}
                                >
                                    {selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : "Select your role"}
                                </button>

                                {/* arrow icon */}
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex">
                                    <Icon size={16} viewBox="0 0 16 16">
                                        <path d="M4 6l4 4 4-4" />
                                    </Icon>
                                </span>

                                {/* dropdown list */}
                                {roleOpen && (
                                    <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                                        {["employee", "manager"].map((role) => (
                                            <div
                                                key={role}
                                                onClick={() => { setSelectedRole(role); setRoleOpen(false); }}
                                                className={`px-4 py-3 text-sm cursor-pointer transition-colors duration-150 hover:bg-indigo-50 hover:text-indigo-600 ${selectedRole === role ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-700"
                                                    }`}
                                            >
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <motion.div variants={fadeUp}>
                            <motion.button
                                whileHover={{ scale: 1.02, background: "#4338ca" }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-5 w-full py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-bold border-none cursor-pointer tracking-wide"
                            >
                                Sign in to workspace
                            </motion.button>
                        </motion.div>


                    </motion.div>





                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-[360px] shrink-0 bg-indigo-50 rounded-[18px] mt-3 mb-3 mr-3 flex flex-col items-center justify-center px-7 pb-8 relative overflow-hidden"
                >
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#818cf8" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                    <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 300 }}>
                        {/* floating cards */}

                        <SprintCard />
                        <CIPill />
                        <motion.img
                            src={removed}
                            alt="Login Illustration"
                            className="w-[140%] max-w-[500px] md:max-w-[700px] mt-20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>







                </motion.div>



            </motion.div>


        </div>
    )
}

export default Login
