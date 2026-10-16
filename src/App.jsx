import { useState } from "react";
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import QuoteDesk from "./components/QuoteDesk";
import RightSidebar from "./components/RightSidebar";

export default function App() {
  // Simple logged-in user state for the POC
  const [user, setUser] = useState({
    name: "Jake",
    email: "jake@ccequipment.ca",
  });

  const handleSignOut = () => {
    setUser(null);
  };

  const handleSignIn = () => {
    setUser({
      name: "Jake",
      email: "jake@ccequipment.ca",
    });
  };

  return (
    <div className="min-h-screen bg-[#090b08] text-[#d8dfcf] p-4 font-mono select-none">
      <Header
        user={user}
        onSignOut={handleSignOut}
        onSignIn={handleSignIn}
      />

      {/* Main 3-Column Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <LeftSidebar />
        </div>
        <div className="lg:col-span-6">
          <QuoteDesk />
        </div>
        <div className="lg:col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}