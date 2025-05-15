import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";
import FileUploader from "./FileUploader";
import JsonInputField from "./JsonInputField";
import PdfEditor from "./PdfEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const formSchema = z
  .object({
    templateName: z.string().min(1, { message: "Template name is required" }),
    validFrom: z.date({ required_error: "Valid from date is required" }),
    validTo: z.date({ required_error: "Valid to date is required" }),
    pdfFile: z
      .instanceof(File, { message: "PDF file is required" })
      .refine((file) => file.type === "application/pdf", {
        message: "File must be a PDF",
      }),
    config: z
      .string()
      .min(1, { message: "Config JSON is required" })
      .refine(
        (val) => {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Config must be valid JSON" },
      ),
    fabric: z
      .string()
      .min(1, { message: "Fabric JSON is required" })
      .refine(
        (val) => {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Fabric must be valid JSON" },
      ),
  })
  .refine((data) => data.validTo >= data.validFrom, {
    message: "Valid to date must be after valid from date",
    path: ["validTo"],
  });

type FormValues = z.infer<typeof formSchema>;

const TemplateForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "editor">("details");
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateName: "",
      config: "",
      fabric: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Convert config and fabric JSON to base64 encoded strings
      const configBase64 = btoa(data.config);
      const fabricBase64 = btoa(data.fabric);

      const formData = new FormData();
      formData.append("templateName", data.templateName);
      formData.append("validFrom", data.validFrom.toISOString());
      formData.append("validTo", data.validTo.toISOString());
      formData.append("pdfFile", data.pdfFile);
      formData.append("config", configBase64);
      formData.append("fabric", fabricBase64);

      const response = await fetch(
        "http://localhost:8081/Template/create-template",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Template created successfully",
        variant: "default",
      });

      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePdfEditorSave = (configJson: string, fabricJson: string) => {
    form.setValue("config", configJson);
    form.setValue("fabric", fabricJson);
    setActiveTab("details");
    toast({
      title: "Template Configured",
      description: "Template fields have been configured successfully",
      variant: "default",
    });
  };

  const handlePdfFileUpload = (file: File | null) => {
    if (file) {
      form.setValue("pdfFile", file);
      setUploadedPdfFile(file);
      // Automatically switch to editor tab when PDF is uploaded
      setActiveTab("editor");
    } else {
      form.setValue("pdfFile", null as any);
      setUploadedPdfFile(null);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Template</CardTitle>
        <CardDescription>
          Fill out the form below to create a new template. All fields are
          required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "details" | "editor")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="details">Template Details</TabsTrigger>
            <TabsTrigger value="editor" disabled={!uploadedPdfFile}>
              PDF Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Template Name */}
                <FormField
                  control={form.control}
                  name="templateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Valid From Date */}
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Valid From</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Valid To Date */}
                  <FormField
                    control={form.control}
                    name="validTo"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Valid To</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <
                                (form.getValues().validFrom || new Date())
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* PDF File Upload */}
                <FormField
                  control={form.control}
                  name="pdfFile"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>PDF Template</FormLabel>
                      <FormControl>
                        <FileUploader
                          onFileChange={(file) => handlePdfFileUpload(file)}
                          acceptedFileTypes="application/pdf"
                          maxSize={10 * 1024 * 1024} // 10MB
                          selectedFile={value as File}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a PDF file for your template. Maximum size: 10MB.
                        {uploadedPdfFile && (
                          <span className="block mt-2 text-sm text-blue-600">
                            After uploading, switch to the PDF Editor tab to add
                            signature fields, text fields, and date fields.
                          </span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Config JSON */}
                <FormField
                  control={form.control}
                  name="config"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Config JSON</FormLabel>
                      <FormControl>
                        <JsonInputField
                          label="Config JSON"
                          name="config"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter config JSON or upload a file"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fabric JSON */}
                <FormField
                  control={form.control}
                  name="fabric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabric JSON</FormLabel>
                      <FormControl>
                        <JsonInputField
                          label="Fabric JSON"
                          name="fabric"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter fabric JSON or upload a file"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CardFooter className="px-0 pt-6">
                  <Button
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Template..." : "Create Template"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="editor" className="border rounded-md">
            <div className="h-[600px]">
              <PdfEditor
                pdfFile={uploadedPdfFile}
                onSave={handlePdfEditorSave}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TemplateForm;
