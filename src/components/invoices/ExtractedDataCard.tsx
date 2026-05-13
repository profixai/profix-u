import { useState } from "react";
import { Pencil, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { InvoiceExtraction, USALISplit } from "@/lib/mock-invoices";
import { reExtractInvoice } from "@/lib/invoices-api";
import { LabeledFieldWithConfidence } from "./LabeledFieldWithConfidence";
import { USALIClassificationSplits } from "./USALIClassificationSplits";

interface Props {
  invoice: InvoiceExtraction;
}

interface Draft {
  vendor: string;
  invoiceNumber: string;
  amount: string;
  invoiceDate: string;
  dueDate: string;
  glCode: string;
  splits: USALISplit[];
}

function toDraft(inv: InvoiceExtraction): Draft {
  return {
    vendor: inv.vendor.value,
    invoiceNumber: inv.invoiceNumber.value,
    amount: String(inv.amount.value),
    invoiceDate: inv.invoiceDate.value,
    dueDate: inv.dueDate.value,
    glCode: inv.glCode.value,
    splits: inv.splits,
  };
}

export function ExtractedDataCard({ invoice }: Props) {
  const [editable, setEditable] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(invoice));

  const patch = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const approve = () => {
    toast.success("Invoice approved (mock — no backend call)", {
      description: `${invoice.invoiceNumber.value} · ${draft.vendor}`,
    });
  };
  const reject = () => {
    toast("Invoice rejected (mock)", {
      description: "Backend not wired yet.",
    });
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border p-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold tracking-tight">Extracted Data</h2>
          <p className="text-xs text-muted-foreground">OCR extracted invoice information</p>
        </div>
        {editable ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => {
                setDraft(toDraft(invoice));
                setEditable(false);
              }}
            >
              <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
            </Button>
            <Button size="sm" className="h-8" onClick={() => setEditable(false)}>
              <Check className="mr-1.5 h-3.5 w-3.5" /> Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="h-8" onClick={() => setEditable(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LabeledFieldWithConfidence
            label="Vendor Name"
            value={draft.vendor}
            confidence={invoice.vendor.confidence}
            editable={editable}
            onChange={(v) => patch("vendor", v)}
          />
          <LabeledFieldWithConfidence
            label="Invoice Number"
            value={draft.invoiceNumber}
            confidence={invoice.invoiceNumber.confidence}
            editable={editable}
            onChange={(v) => patch("invoiceNumber", v)}
          />
          <LabeledFieldWithConfidence
            label="Amount"
            value={draft.amount}
            confidence={invoice.amount.confidence}
            editable={editable}
            inputMode="decimal"
            onChange={(v) => patch("amount", v)}
          />
          <LabeledFieldWithConfidence
            label="Invoice Date"
            value={draft.invoiceDate}
            confidence={invoice.invoiceDate.confidence}
            editable={editable}
            onChange={(v) => patch("invoiceDate", v)}
          />
          <LabeledFieldWithConfidence
            label="Due Date"
            value={draft.dueDate}
            confidence={invoice.dueDate.confidence}
            editable={editable}
            onChange={(v) => patch("dueDate", v)}
          />
          <LabeledFieldWithConfidence
            label="GL Code"
            value={draft.glCode}
            confidence={invoice.glCode.confidence}
            editable={editable}
            onChange={(v) => patch("glCode", v)}
          />
        </div>

        <Separator className="my-5" />

        <USALIClassificationSplits
          splits={draft.splits}
          editable={editable}
          onChange={(next) => patch("splits", next)}
        />
      </CardContent>

      <div className="flex items-center justify-end gap-2 border-t border-border p-4">
        <Button variant="outline" onClick={reject}>
          Reject
        </Button>
        <Button onClick={approve}>Approve</Button>
      </div>
    </Card>
  );
}
