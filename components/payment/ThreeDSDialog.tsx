import { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ThreeDSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  method: string;
  payload: Record<string, string>;
}

export function ThreeDSDialog({ isOpen, onClose, url, method, payload }: ThreeDSDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isOpen || !url) return;

    // Create a temporary form element
    const form = document.createElement('form');
    form.method = method.toLowerCase();
    form.action = url;
    form.target = 'threeds-frame';
    form.style.display = 'none';

    // Add the payload fields
    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Add the form to the document
    document.body.appendChild(form);

    // Submit the form after a short delay to ensure iframe is ready
    setTimeout(() => {
      form.submit();
      document.body.removeChild(form);
    }, 100);
  }, [isOpen, url, method, payload]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[600px] h-[700px] p-0 overflow-hidden"
        style={{ maxWidth: '600px' }}
      >
        <DialogHeader className="p-6 bg-background">
          <DialogTitle className="text-xl font-semibold">
            3D Secure Verification
            <VisuallyHidden> dialog</VisuallyHidden>
          </DialogTitle>
          <DialogDescription id="payment-verification-desc">
            Please complete the verification process to secure your payment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-[600px] bg-white border-t">
          <iframe
            ref={iframeRef}
            name="threeds-frame"
            className="w-full h-full"
            style={{ border: 'none' }}
            title="3D Secure Verification"
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox allow-modals"
          />
        </div>
        
        <DialogClose className="absolute right-4 top-4">
          <VisuallyHidden>Close</VisuallyHidden>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}