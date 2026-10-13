import { BrandLoadingOverlay } from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <BrandLoadingOverlay
      fullScreen={true}
      message="Loading page..."
      subtext="HireLocal • Hyperlocal Job Portal"
    />
  );
}
