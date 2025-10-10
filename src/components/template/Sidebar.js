import React from "react";

function Sidebar() {
  return (
    <div>
      <aside className="main-sidebar sidebar-colors elevation-4">
        <a href="http://localhost:3000/" className="brand-link">
          <div className="sidebar-logo">
            <img src="/dist/img/logo.png" alt="Logo" className="logo-big" />
          </div>
          {/* <span className="brand-text font-weight-light">Admin</span> */}
        </a>
        {/* <a href="#" className="brand-link">
          <img
            src="/dist/img/logo.png"
            alt="AdminLTE Logo"
            className="brand-image img-circle elevation-3"
            style={{ opacity: "0.8" }}
          />
          <span className="brand-text font-weight-light">Admin</span>
        </a> */}

        {/* sidebar-dark-primary */}
        {/* <a href="#" className="brand-link brand-logo-only">
            <img
              src="/dist/img/logo.png"
              alt="Logo"
              className="brand-image img-circle elevation-3"
              style={{ opacity: "0.9" }}
            />
          </a> */}
        <div className="sidebar">
          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              {/* <li className="nav-item">
                <a href="#" className="nav-link">
                  <i className="nav-icon fas fa-tachometer-alt" />
                  <p>
                    Dashboard
                    <i className="right fas fa-angle-left" />
                  </p>
                </a>
                <ul className="nav nav-treeview">
                  <li className="nav-item">
                    <a href="/index.html" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Dashboard v1</p>
                    </a>
                  </li>
                </ul>
              </li> */}
              <li className="nav-item">
                <a href="http://localhost:3000/" className="nav-link active">
                  <i className="nav-icon fas fa-th" />
                  <p>Dashboard</p>
                </a>
              </li>
            </ul>
          </nav>
          {/* /.sidebar-menu */}
        </div>
        {/* /.sidebar */}
      </aside>
    </div>
  );
}

export default Sidebar;
