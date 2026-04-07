"use client";
import FullScreenMobileMenu from "@/app/component/application/menu";

import React from "react";
import MatchCards from "../component/application/match-card";

const Dashboard = () => {
  return (
    <main className="w-full sm:w-3xl m-auto  mb-8">
      <FullScreenMobileMenu />
      <MatchCards />
    </main>
  );
};

export default Dashboard;
