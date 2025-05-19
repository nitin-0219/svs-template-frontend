import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Check,
  Calendar,
  FileSignature,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import SignaturePad from "@/components/SignaturePad";
import { Document, SignerAssignment, SigningField } from "@/types/template";

interface FormValues {
  [key: string]: string | boolean | Date;
}

const DocumentSigning = () => {
  const { documentId, signerId } = useParams<{
    documentId: string;
    signerId: string;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [document, setDocument] = useState<Document | null>(null);
  const [signerAssignment, setSignerAssignment] =
    useState<SignerAssignment | null>(null);
  const [signerFields, setSignerFields] = useState<SigningField[]>([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Create dynamic form schema based on fields
  const createFormSchema = (fields: SigningField[]) => {
    const schemaObj: Record<string, any> = {};

    fields.forEach((field) => {
      switch (field.type) {
        case "text":
          schemaObj[field.id] = field.required
            ? z.string().min(1, { message: `${field.label} is required` })
            : z.string().optional();
          break;
        case "date":
          schemaObj[field.id] = field.required
            ? z.date({ required_error: `${field.label} is required` })
            : z.date().optional();
          break;
        case "checkbox":
          schemaObj[field.id] = field.required
            ? z.boolean().refine((val) => val === true, {
                message: `${field.label} must be checked`,
              })
            : z.boolean().optional();
          break;
        case "signature":
          schemaObj[field.id] = field.required
            ? z.string().min(1, { message: `Signature is required` })
            : z.string().optional();
          break;
      }
    });

    return z.object(schemaObj);
  };

  // Fetch document and signer data
  useEffect(() => {
    const fetchData = async () => {
      if (!documentId || !signerId) {
        toast({
          title: "Error",
          description: "Invalid document or signer ID",
          variant: "destructive",
        });
        return;
      }

      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll create mock data
        const mockDocument: Document = {
          id: documentId,
          name: "Sample Contract",
          status: "pending",
          pdfUrl:
            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          fields: [
            {
              id: "field-1",
              type: "text",
              page: 1,
              position: { x: 100, y: 200 },
              size: { width: 200, height: 30 },
              label: "Full Name",
              required: true,
            },
            {
              id: "field-2",
              type: "date",
              page: 1,
              position: { x: 100, y: 250 },
              size: { width: 200, height: 30 },
              label: "Signing Date",
              required: true,
            },
            {
              id: "field-3",
              type: "checkbox",
              page: 1,
              position: { x: 100, y: 300 },
              size: { width: 20, height: 20 },
              label: "I agree to the terms and conditions",
              required: true,
            },
            {
              id: "field-4",
              type: "signature",
              page: 1,
              position: { x: 100, y: 350 },
              size: { width: 300, height: 100 },
              label: "Signature",
              required: true,
            },
          ],
        };

        const mockSignerAssignment: SignerAssignment = {
          signerId: signerId,
          signerName: "John Doe",
          signerEmail: "john.doe@example.com",
          fields: ["field-1", "field-2", "field-3", "field-4"],
          status: "pending",
        };

        setDocument(mockDocument);
        setSignerAssignment(mockSignerAssignment);

        // Filter fields assigned to this signer
        const assignedFields = mockDocument.fields.filter((field) =>
          mockSignerAssignment.fields.includes(field.id),
        );
        setSignerFields(assignedFields);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching document data:", error);
        toast({
          title: "Error",
          description: "Failed to load document. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [documentId, signerId, toast]);

  // Create form with dynamic schema
  const formSchema = createFormSchema(signerFields);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: signerFields.reduce((acc, field) => {
      if (field.type === "checkbox") {
        acc[field.id] = false;
      } else if (field.type === "date") {
        acc[field.id] = new Date();
      } else {
        acc[field.id] = "";
      }
      return acc;
    }, {} as FormValues),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call to submit the signed document
      console.log("Submitting signed document:", {
        documentId,
        signerId,
        fields: data,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmissionSuccess(true);
      toast({
        title: "Success",
        description: "Document signed successfully!",
      });
    } catch (error) {
      console.error("Error submitting signed document:", error);
      toast({
        title: "Error",
        description: "Failed to submit signed document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <Card className="max-w-2xl mx-auto bg-white shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Document Signed Successfully!
            </CardTitle>
            <CardDescription>
              Thank you for completing the signing process. All parties will be
              notified once everyone has signed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to your email address. The
              document has been digitally signed and an ASiC-E container with
              XAdES-BES signatures has been created.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => window.close()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Close Window
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!document || !signerAssignment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <Card className="max-w-2xl mx-auto bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">
              Document Not Found
            </CardTitle>
            <CardDescription>
              The document you're looking for doesn't exist or you don't have
              permission to access it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please check the link and try again, or contact the sender for
              assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-center mb-8">
          <FileSignature className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            SelfieSign Pro
          </h1>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {document.name}
            </CardTitle>
            <CardDescription>
              Please review the document and complete all required fields below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <div className="border rounded-md overflow-hidden">
                <iframe
                  src={document.pdfUrl}
                  className="w-full h-[500px]"
                  title="Document Preview"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Scroll through the document to review before signing.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Signer Information</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{signerAssignment.signerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{signerAssignment.signerEmail}</p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium">Required Fields</h3>

                {signerFields.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem className="p-4 border rounded-md bg-white">
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          {field.type === "text" && <Input {...formField} />}

                          {field.type === "date" && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !formField.value &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    {formField.value ? (
                                      format(formField.value as Date, "PPP")
                                    ) : (
                                      <span>Select date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  mode="single"
                                  selected={formField.value as Date}
                                  onSelect={formField.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}

                          {field.type === "checkbox" && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={formField.value as boolean}
                                onCheckedChange={formField.onChange}
                              />
                              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {field.label}
                              </label>
                            </div>
                          )}

                          {field.type === "signature" && (
                            <SignaturePad
                              onChange={formField.onChange}
                              value={formField.value as string}
                              width={400}
                              height={200}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <CardFooter className="px-0 pt-6">
                  <Button
                    type="submit"
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Complete Signing
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentSigning;
