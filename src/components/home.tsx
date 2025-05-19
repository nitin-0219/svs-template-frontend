import TemplateForm from "./TemplateForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileSignature, FileText, PenTool } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center mb-12">
          <FileSignature className="h-10 w-10 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            SelfieSign Pro
          </h1>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-medium text-gray-700 mb-3">
            A Digital Platform for All Your Document Needs
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Streamline your document workflows with our powerful yet simple
            digital signature and document management solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-xl shadow-lg bg-white border border-blue-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Template Management</h2>
            </div>
            <p className="text-gray-600 mb-6 h-20">
              Create and manage document templates with customizable fields.
              Design once, use repeatedly for consistent document generation.
            </p>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              asChild
            >
              <Link to="/documents">Manage Documents</Link>
            </Button>
          </div>

          <div className="p-8 rounded-xl shadow-lg bg-white border border-blue-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <PenTool className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Document Creation</h2>
            </div>
            <p className="text-gray-600 mb-6 h-20">
              Create documents from templates and send them for signing. Track
              status and manage the entire signing workflow in one place.
            </p>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              asChild
            >
              <Link to="/create-document">Create Document</Link>
            </Button>
          </div>

          <div className="p-8 rounded-xl shadow-lg bg-white border border-blue-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <FileSignature className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Document Signing</h2>
            </div>
            <p className="text-gray-600 mb-6 h-20">
              Sign documents securely with our electronic signature solution.
              Review document contents and complete the signing process in a few
              simple steps.
            </p>
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              asChild
            >
              <Link to="/sign-document">Sign Document</Link>
            </Button>
          </div>
        </div>

        <TemplateForm />
      </div>
    </div>
  );
}

export default Home;
