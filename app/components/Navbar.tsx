import React from 'react';
import {Link} from "react-router";
import { usePuterStore } from '~/lib/puter';

const Navbar = () => {
     const { auth } = usePuterStore();
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMARK</p>
            </Link>
            <Link to="/upload" className="primary-button w-fit">
                Upload Resume
            </Link>
            <button className="primary-button  w-fit" onClick={auth.signOut}>Log out</button>
        </nav>
    );
};

export default Navbar;