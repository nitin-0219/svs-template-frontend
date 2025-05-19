import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import DocumentCreation from "./components/DocumentCreation";
import DocumentSigning from "./components/DocumentSigning";
import DocumentList from "./components/DocumentList";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-document" element={<DocumentCreation />} />
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/sign-document" element={<DocumentSigning />} />
          <Route
            path="/sign/:documentId/:signerId"
            element={<DocumentSigning />}
          />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
