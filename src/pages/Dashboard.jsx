import React, { Component } from "react";
import Navbar from "../components/template/Navbar";
import Sidebar from "../components/template/Sidebar";
import Content from "../components/index/Content";
import Footer from "../components/template/Footer";

function Dashboard() {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <Content />
      <Footer />
    </div>
  );
}

export default Dashboard;
