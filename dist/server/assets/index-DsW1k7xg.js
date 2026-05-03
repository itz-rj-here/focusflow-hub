import { r as reactExports } from "./worker-entry-RQlX2Pcr.js";
var useLayoutEffect2 = globalThis?.document ? reactExports.useLayoutEffect : () => {
};
function useCallbackRef(callback) {
  const callbackRef = reactExports.useRef(callback);
  reactExports.useEffect(() => {
    callbackRef.current = callback;
  });
  return reactExports.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}
export {
  useLayoutEffect2 as a,
  useCallbackRef as u
};
