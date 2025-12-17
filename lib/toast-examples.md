# Toast Notification Usage Examples

This file shows how to use toast notifications throughout the dashboard.

## Basic Usage

```typescript
import { showToast } from "@/lib/toast";

// Success message
showToast.success("Operation completed successfully!");

// Error message
showToast.error("Something went wrong. Please try again.");

// Info message
showToast.info("This is an informational message");

// Warning message
showToast.warning("Please review your input");
```

## Promise-based Operations

```typescript
import { showToast } from "@/lib/toast";

// For async operations with loading state
const toastId = showToast.loading("Processing...");

try {
  await someAsyncOperation();
  toast.dismiss(toastId);
  showToast.success("Operation completed!");
} catch (error) {
  toast.dismiss(toastId);
  showToast.error("Operation failed!");
}

// Or use promise helper
showToast.promise(
  someAsyncOperation(),
  {
    loading: "Processing...",
    success: "Operation completed!",
    error: "Operation failed!"
  }
);
```

## Common Dashboard Actions

### Create/Update/Delete Operations

```typescript
// Create
try {
  await apiPost("/programs", data);
  showToast.success("Program created successfully!");
  router.push("/dashboard/partner/programs");
} catch (error: any) {
  showToast.error(error.message || "Failed to create program");
}

// Update
try {
  await apiPut(`/programs/${id}`, data);
  showToast.success("Program updated successfully!");
} catch (error: any) {
  showToast.error(error.message || "Failed to update program");
}

// Delete
const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this?")) return;
  
  try {
    await apiDelete(`/programs/${id}`);
    showToast.success("Program deleted successfully!");
    router.refresh();
  } catch (error: any) {
    showToast.error(error.message || "Failed to delete program");
  }
};
```

### Status Changes

```typescript
try {
  await apiPatch(`/applications/${id}/status`, { status: "APPROVED" });
  showToast.success("Application approved successfully!");
} catch (error: any) {
  showToast.error(error.message || "Failed to update status");
}
```

### Block/Unblock Actions

```typescript
try {
  await apiPatch(`/applications/${id}/block`, { isBlocked: true, reason: "Non-payment" });
  showToast.success("Student blocked successfully");
} catch (error: any) {
  showToast.error(error.message || "Failed to block student");
}
```

