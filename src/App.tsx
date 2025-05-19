import { Routes, Route } from "react-router-dom";
import Home from "./components/home";  // Using default import
import DocumentCreation from "./components/DocumentCreation";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <>
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-document" element={<DocumentCreation />} />
        </Routes>
      </main>
      <Toaster />
    </>
  );
}

export default App;
