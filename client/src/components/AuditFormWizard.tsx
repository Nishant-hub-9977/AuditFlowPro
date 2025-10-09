import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  "Basic Info",
  "Checklist",
  "Observations",
  "Business Intel",
  "Follow-up"
];

export function AuditFormWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    auditDate: "",
    auditorName: "",
    customerName: "",
    siteLocation: "",
    industryType: "",
    auditType: "",
    geoLocation: "Auto-detected: 28.6139° N, 77.2090° E",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Audit form submitted", formData);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  index <= currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className="mt-2 text-xs font-medium">{step}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 w-16 ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="auditDate">Audit Date</Label>
                <Input
                  id="auditDate"
                  type="date"
                  value={formData.auditDate}
                  onChange={(e) => setFormData({ ...formData, auditDate: e.target.value })}
                  data-testid="input-audit-date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="auditorName">Auditor Name</Label>
                <Input
                  id="auditorName"
                  value={formData.auditorName}
                  onChange={(e) => setFormData({ ...formData, auditorName: e.target.value })}
                  data-testid="input-auditor-name"
                  placeholder="Enter auditor name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  data-testid="input-customer-name"
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="siteLocation">Site Location</Label>
                <Input
                  id="siteLocation"
                  value={formData.siteLocation}
                  onChange={(e) => setFormData({ ...formData, siteLocation: e.target.value })}
                  data-testid="input-site-location"
                  placeholder="Enter site location"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="industryType">Industry Type</Label>
                <Select
                  value={formData.industryType}
                  onValueChange={(value) => setFormData({ ...formData, industryType: value })}
                >
                  <SelectTrigger id="industryType" data-testid="select-industry-type">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pharma">Pharmaceutical</SelectItem>
                    <SelectItem value="chemical">Chemical</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="auditType">Audit Type</Label>
                <Select
                  value={formData.auditType}
                  onValueChange={(value) => setFormData({ ...formData, auditType: value })}
                >
                  <SelectTrigger id="auditType" data-testid="select-audit-type">
                    <SelectValue placeholder="Select audit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire">Fire Safety</SelectItem>
                    <SelectItem value="electrical">Electrical Safety</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Geo-Location</Label>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-muted p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{formData.geoLocation}</span>
                  <Badge variant="secondary" className="ml-auto">Auto-detected</Badge>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Complete the audit checklist for this inspection
              </p>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <p className="font-medium">Question {i}: Safety equipment inspection</p>
                    <Textarea
                      placeholder="Enter observations and current status"
                      data-testid={`input-checklist-${i}`}
                    />
                    <Input placeholder="Recommendations" data-testid={`input-recommendation-${i}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Major Non-Compliances</Label>
                <Textarea
                  placeholder="Describe any major non-compliances observed"
                  data-testid="input-non-compliances"
                />
              </div>
              <div className="grid gap-2">
                <Label>Safety Hazards</Label>
                <Textarea
                  placeholder="List any safety hazards identified"
                  data-testid="input-safety-hazards"
                />
              </div>
              <div className="grid gap-2">
                <Label>Employee Awareness Level</Label>
                <Select>
                  <SelectTrigger data-testid="select-awareness-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Client Openness to Support</Label>
                <Select>
                  <SelectTrigger data-testid="select-client-openness">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Potential Needs</Label>
                <Textarea
                  placeholder="Describe potential business needs and opportunities"
                  data-testid="input-potential-needs"
                />
              </div>
              <div className="grid gap-2">
                <Label>Lead Recommendations</Label>
                <Textarea
                  placeholder="Any lead recommendations for products/services"
                  data-testid="input-lead-recommendations"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Client Interest Level</Label>
                <Select>
                  <SelectTrigger data-testid="select-client-interest">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Contact Details</Label>
                <Input placeholder="Email or phone" data-testid="input-contact-details" />
              </div>
              <div className="grid gap-2">
                <Label>Auditor Comments</Label>
                <Textarea
                  placeholder="Additional comments and notes"
                  data-testid="input-auditor-comments"
                />
              </div>
              <div className="grid gap-2">
                <Label>Upload Documents</Label>
                <Input type="file" multiple data-testid="input-upload-documents" />
                <p className="text-xs text-muted-foreground">Upload photos or documents (max 10 files)</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              data-testid="button-prev-step"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit} data-testid="button-submit-audit">
                Submit Audit
                <Check className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} data-testid="button-next-step">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
