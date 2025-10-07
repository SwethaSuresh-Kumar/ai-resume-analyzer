import React, { useState } from 'react';
import { Link } from "react-router";
import { usePuterStore } from '~/lib/puter';

const Navbar = () => {
    const { auth } = usePuterStore();
    const isAuthenticated = auth.isAuthenticated;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar flex items-center justify-between px-4 py-2">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMARK</p>
            </Link>
            {/* Burger icon for small screens */}
            <button
                className="md:hidden flex flex-col justify-center items-center w-8 h-8"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {!menuOpen ? (
                    <>
                        <span className="burger-bar block h-1 w-6 bg-black mb-1 transition-all"></span>
                        <span className="burger-bar block h-1 w-6 bg-black mb-1 transition-all"></span>
                        <span className="burger-bar block h-1 w-6 bg-black transition-all"></span>
                    </>
                ) : (
                    // Close (X) icon
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                )}
            </button>
            {/* Menu items */}
            <div className={`flex-col md:flex-row md:flex gap-4 items-center ${menuOpen ? 'flex absolute top-14 left-0 w-full bg-white z-10 p-4' : 'hidden md:flex'}`}>
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
                <button
                    className="primary-button w-fit"
                    onClick={async () => {
                        if (isAuthenticated) {
                            await auth.signOut();
                        } else {
                            await auth.signIn();
                        }
                        window.location.reload();
                    }}
                >
                    {isAuthenticated ? "Log Out" : "Log In"}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;