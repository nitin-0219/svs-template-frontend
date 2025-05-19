import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSignature,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface DocumentItem {
  id: string;
  name: string;
  createdAt: string;
  status: "pending" | "completed" | "expired";
  signers: {
    name: string;
    email: string;
    status: "pending" | "completed";
  }[];
}

const DocumentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const [emailAddress, setEmailAddress] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock documents data
  const documents: DocumentItem[] = [
    {
      id: "doc-001",
      name: "Employment Contract",
      createdAt: "2023-05-15T10:30:00Z",
      status: "pending",
      signers: [
        {
          name: "John Doe",
          email: "john.doe@example.com",
          status: "pending",
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          status: "pending",
        },
      ],
    },
    {
      id: "doc-002",
      name: "Non-Disclosure Agreement",
      createdAt: "2023-05-10T14:20:00Z",
      status: "completed",
      signers: [
        {
          name: "Alice Johnson",
          email: "alice@example.com",
          status: "completed",
        },
      ],
    },
    {
      id: "doc-003",
      name: "Sales Contract",
      createdAt: "2023-05-05T09:15:00Z",
      status: "pending",
      signers: [
        {
          name: "Bob Williams",
          email: "bob@example.com",
          status: "completed",
        },
        {
          name: "Charlie Brown",
          email: "charlie@example.com",
          status: "pending",
        },
      ],
    },
    {
      id: "doc-004",
      name: "Lease Agreement",
      createdAt: "2023-04-28T16:45:00Z",
      status: "expired",
      signers: [
        {
          name: "David Miller",
          email: "david@example.com",
          status: "pending",
        },
      ],
    },
  ];

  // Filter documents based on search term and status filter
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? doc.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleSignDocument = (documentId: string) => {
    // In a real app, you would get the signer ID from the current user's context
    const signerId = "current-user-id";
    navigate(`/sign/${documentId}/${signerId}`);
  };

  const handleSendEmail = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsEmailDialogOpen(true);
  };

  const sendSigningLink = async () => {
    if (!emailAddress || !selectedDocumentId) return;

    setIsSending(true);
    try {
      // In a real app, this would be an API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Signing link sent",
        description: `A signing link has been sent to ${emailAddress}`,
      });

      setIsEmailDialogOpen(false);
      setEmailAddress("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send signing link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "expired":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <AlertCircle className="h-3 w-3 mr-1" /> Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 bg-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            My Documents
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your document signing requests
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => navigate("/create-document")}
        >
          <FileSignature className="mr-2 h-4 w-4" /> Create New Document
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-1/2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    {statusFilter
                      ? `Status: ${statusFilter}`
                      : "Filter by status"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("completed")}
                  >
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("expired")}>
                    Expired
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredDocuments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FileSignature className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter
                ? "Try adjusting your search or filters"
                : "Create your first document to get started"}
            </p>
            {!searchTerm && !statusFilter && (
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => navigate("/create-document")}
              >
                <FileSignature className="mr-2 h-4 w-4" /> Create New Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{formatDate(doc.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {doc.signers.map((signer, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <span className="truncate max-w-[150px]">
                            {signer.name}
                          </span>
                          <span className="mx-1">•</span>
                          {signer.status === "completed" ? (
                            <span className="text-green-600 text-xs font-medium">
                              Signed
                            </span>
                          ) : (
                            <span className="text-yellow-600 text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {doc.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(doc.id)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" /> Send
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSignDocument(doc.id)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            <FileSignature className="h-3.5 w-3.5 mr-1" /> Sign
                          </Button>
                        </>
                      )}
                      {doc.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      )}
                      {doc.status === "expired" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-gray-600 border-gray-200 hover:bg-gray-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Signing Link</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to send the signing
              link to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Email address"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={sendSigningLink}
              disabled={!emailAddress || isSending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Send Link
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentList;
