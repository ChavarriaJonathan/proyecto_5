import React from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import './Navbar.css';
import { FaHome, FaFileAlt } from "react-icons/fa"; 

const Navbar = () => {
    const location = useLocation(); 

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src="https://framework-gb.cdn.gob.mx/gobmx/img/logo_blanco.svg" alt="SECIHTI Logo" />
            </div>
            <ul className="navbar-links">
                <li>
                    <Link 
                        to="/Home" 
                        className={location.pathname === '/Home' ? 'active-link' : ''}
                    >
                        <FaHome />
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/PresionDelGasto" 
                        className={location.pathname === '/PresionDelGasto' ? 'active-link' : ''}
                    >
                        Tablero Presión del Gasto
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/Resumen" 
                        className={location.pathname === '/Resumen' ? 'active-link' : ''}
                    >
                        <FaFileAlt style={{ marginRight: "5px" }} /> Resumen
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;