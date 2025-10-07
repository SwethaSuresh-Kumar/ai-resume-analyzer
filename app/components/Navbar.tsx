import React from 'react';
import {Link} from "react-router";
import { usePuterStore } from '~/lib/puter';

const Navbar = () => {
     const { auth } = usePuterStore();
     const isAuthenticated = auth.isAuthenticated;
     // console.log(isAuthenticated);
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMARK</p>
            </Link>
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

        </nav>
    );
};

export default Navbar;