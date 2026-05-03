import { c as createLucideIcon } from "./createLucideIcon-CtsaNwvN-DSqP8f5b-Cr1_PVNQ.js";
import { J as reactExports, j as jsxRuntimeExports } from "./worker-entry-Diy4BZeW.js";
import { c as cn } from "./utils-D3x33Gqd-DMudbEkB-Cf7-GG9X.js";
const __iconNode = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode);
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
export {
  Check as C,
  Input as I
};
