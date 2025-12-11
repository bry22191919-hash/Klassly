import React from "react";
import Sidebar from "../Components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7fafc" }}>
      {/* Sidebar with integrated header */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: "240px",
        transition: "margin-left 0.3s ease",
        position: "relative"
      }}>
        {/* Page Content */}
        <main style={{ padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;