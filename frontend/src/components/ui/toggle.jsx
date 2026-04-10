import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { Toggle, toggleVariants } from "@/components/ui/toggle";

// Context باش ToggleGroupItems يعرفو variant و size ديال ToggleGroup
const ToggleGroupContext = React.createContext({
  variant: "default",
  size: "default",
});

// ToggleGroup component
const ToggleGroup = React.forwardRef(({ variant, size, className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("inline-flex gap-2", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = "ToggleGroup";

// ToggleGroupItem component
const ToggleGroupItem = React.forwardRef(({ className, variant, size, children, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <Toggle
      ref={ref}
      variant={variant || context.variant}
      size={size || context.size}
      className={className}
      {...props}
    >
      {children}
    </Toggle>
  );
});

ToggleGroupItem.displayName = "ToggleGroupItem";

// مثال ديال الاستعمال
export default function Example() {
  return (
    <ToggleGroup type="single" defaultValue="left" aria-label="Text alignment" variant="outline" size="sm">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  );
}

export { ToggleGroup, ToggleGroupItem };