import { StandardDialog } from "@/components/StandardDialog";
import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onOpenChange,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <StandardDialog
      description={description}
      footerRight={
        <>
          <Button onClick={() => onOpenChange(false)} variant="outline">{cancelLabel}</Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            variant="destructive"
          >
            {confirmLabel}
          </Button>
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      showCloseButton={false}
      size="sm"
      title={title}
    />
  );
}
