import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`dashboard-layout ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    {isSidebarOpen ? '\u2715' : '\u2630'}
                </button>
                <nav>
                    <ul>
                        <li><NavLink to="/dashboard" end><i className="fas fa-tachometer-alt"></i><span>Dashboard</span></NavLink></li>
                        <li><NavLink to="/dashboard/devices"><i className="fas fa-box"></i><span>Devices</span></NavLink></li>
                        <li><NavLink to="/dashboard/live"><i className="fas fa-map-marker-alt"></i><span>Live Map</span></NavLink></li>
                        <li><NavLink to="/dashboard/history"><i className="fas fa-history"></i><span>History</span></NavLink></li>
                        <li><NavLink to="/dashboard/geofencing"><i className="fas fa-draw-polygon"></i><span>Geofencing</span></NavLink></li>
                        <li><NavLink to="/dashboard/reports"><i className="fas fa-chart-bar"></i><span>Reports</span></NavLink></li>
                        <li><NavLink to="/dashboard/profile"><i className="fas fa-user"></i><span>Profile</span></NavLink></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
