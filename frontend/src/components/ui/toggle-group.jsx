import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup"; // هاد هو الكومبوننت اللي درنا
import { toggleVariants } from "./ui/toggle"; // هاد هو cva ديالك

export function ExampleToggleGroup() {
  const [value, setValue] = React.useState<string>("left");

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => setValue(val)}
      variant="default" // ممكن "destructive"
      size="default" // ممكن "sm" أو "lg"
      className="bg-gray-50 p-2 rounded-md"
    >
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  );
}