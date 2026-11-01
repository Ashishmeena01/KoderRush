import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AppRoutes } from "@/routes/AppRoutes";
import { Toaster } from "sonner";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
          <Toaster richColors position="top-right" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
