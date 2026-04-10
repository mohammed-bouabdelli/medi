import React, { useState } from "react";
import { CommandDialog, CommandInput, CommandList, CommandItem } from "./components/Command";
import { Button } from "@/components/ui/button";

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search commands..." />
        <CommandList>
          <CommandItem onSelect={() => alert("New File")}>New File</CommandItem>
          <CommandItem onSelect={() => alert("Open File")}>Open File</CommandItem>
          <CommandItem onSelect={() => alert("Save")}>Save</CommandItem>
        </CommandList>
      </CommandDialog>
    </div>
  );
}