import * as React from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuShortcut,
} from "@/components/ui/context-menu";

export default function DemoContextMenu() {
  const [checked, setChecked] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState("option1");

  return (
    <div className="p-10">
      <ContextMenu>
        <ContextMenuTrigger>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Right Click Me
          </button>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem onSelect={() => alert("Edit clicked")}>
            Edit <ContextMenuShortcut>⌘E</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => alert("Delete clicked")}>
            Delete <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuCheckboxItem
            checked={checked}
            onCheckedChange={setChecked}
          >
            Enable Feature
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />

          <ContextMenuRadioItem
            value="option1"
            checked={radioValue === "option1"}
            onSelect={() => setRadioValue("option1")}
          >
            Option 1
          </ContextMenuRadioItem>
          <ContextMenuRadioItem
            value="option2"
            checked={radioValue === "option2"}
            onSelect={() => setRadioValue("option2")}
          >
            Option 2
          </ContextMenuRadioItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}