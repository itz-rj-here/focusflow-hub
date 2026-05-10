import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-DjGEjCzc.js";
import { B as Button } from "./button-C6F0vW5T.js";
import { u as useAuth, t as toast } from "./router-GODDhvyN.js";
function GoogleSignInButton({ className }) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = reactExports.useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handle, disabled: loading, size: "lg", variant: "secondary", className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "mr-2 h-5 w-5", viewBox: "0 0 24 24", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",
          fill: "#4285F4"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
          fill: "#34A853"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z",
          fill: "#FBBC05"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "path",
        {
          d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z",
          fill: "#EA4335"
        }
      )
    ] }),
    loading ? "Signing in…" : "Continue with Google"
  ] });
}
export {
  GoogleSignInButton as G
};
