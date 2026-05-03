import { J as reactExports, j as jsxRuntimeExports } from "./worker-entry-Diy4BZeW.js";
import { u as useAuth, a as useNavigate, L as Link } from "./router-CCG5AACC-CZ-yG0ZH-CEfRNWjS.js";
import { G as GoogleSignInButton } from "./GoogleSignInButton-CAiJG1ND-CyyOZht_-CY2z-sOG.js";
import { T as Timer } from "./timer-BlPlwYpc-DWRxKJwO-TM1GNCSE.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon-CtsaNwvN-DSqP8f5b-Cr1_PVNQ.js";
import "./utils-D3x33Gqd-DMudbEkB-Cf7-GG9X.js";
function LoginPage() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (!loading && user) navigate({
      to: "/app"
    });
  }, [user, loading, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "bg-radial-glow grid min-h-screen place-items-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl card-royal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mb-6 flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Timer, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold tracking-tight", children: "FocusFlow" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-center text-xl font-semibold tracking-tight", children: "Welcome back" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-center text-sm text-muted-foreground", children: "Sign in to continue your focus streak." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleSignInButton, { className: "w-full h-11" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-center text-xs text-muted-foreground", children: "By continuing you agree to be awesome at studying." })
  ] }) });
}
export {
  LoginPage as component
};
