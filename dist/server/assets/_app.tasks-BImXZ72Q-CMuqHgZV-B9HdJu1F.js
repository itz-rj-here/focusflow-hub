import { J as reactExports, j as jsxRuntimeExports } from "./worker-entry-Diy4BZeW.js";
import { u as useAuth, c as useQueryClient, a as useNavigate, t as toast, s as supabase } from "./router-CCG5AACC-CZ-yG0ZH-CEfRNWjS.js";
import { u as useQuery } from "./useQuery-CL9XlL6_-f7iywAgy-FK-t7j3Q.js";
import { u as useMutation } from "./useMutation-BdEHgP_r-BYVLmOlr-cdXYLdSh.js";
import { B as Button } from "./createLucideIcon-CtsaNwvN-DSqP8f5b-Cr1_PVNQ.js";
import { I as Input, C as Check } from "./input-xN65qu55-Cb6HfGTW-BqnWnRxw.js";
import { c as cn, u as useComposedRefs } from "./utils-D3x33Gqd-DMudbEkB-Cf7-GG9X.js";
import { P as Primitive, u as useControllableState, c as composeEventHandlers, a as createContextScope } from "./index-BRVXRqRH-BElZ5nYJ-BRr3V-7u.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, u as usePrevious, e as useSize } from "./select-Dikw9mKM-DzrkiKG5-DOAP7qX3.js";
import { P as Presence } from "./index-BrxZFvwL-Dn5wxDls-Bwxupdmj.js";
import { C as Card } from "./card-BAIauDhZ-B_KVktr--Bn4QS8_v.js";
import { P as Plus, X } from "./x-Di26MCSS-Cpt71yiL-BtAI8HPd.js";
import { P as Play } from "./play-DXCsWtF--E4dEgA4f-BIhORaWJ.js";
import { P as Pencil } from "./pencil-CySl4ygM-DHmenpqs-BK7TpWkF.js";
import { T as Trash2 } from "./trash-2-Cw1U5DpC-B7EILOw1-ntFVQpg0.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BFUGqzIj-DUwf_lYE-BnmkkcHl.js";
import "./index-DUskYfy5-3rKdxkJi-C3opnE_9.js";
import "./index-CIBqEyWd-Cq3cJyq1-DJubqICK.js";
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext] = createContextScope(CHECKBOX_NAME);
var [CheckboxProviderImpl, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
function CheckboxProvider(props) {
  const {
    __scopeCheckbox,
    checked: checkedProp,
    children,
    defaultChecked,
    disabled,
    form,
    name,
    onCheckedChange,
    required,
    value = "on",
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked ?? false,
    onChange: onCheckedChange,
    caller: CHECKBOX_NAME
  });
  const [control, setControl] = reactExports.useState(null);
  const [bubbleInput, setBubbleInput] = reactExports.useState(null);
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const isFormControl = control ? !!form || !!control.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    true
  );
  const context = {
    checked,
    disabled,
    setChecked,
    control,
    setControl,
    name,
    form,
    value,
    hasConsumerStoppedPropagationRef,
    required,
    defaultChecked: isIndeterminate(defaultChecked) ? false : defaultChecked,
    isFormControl,
    bubbleInput,
    setBubbleInput
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CheckboxProviderImpl,
    {
      scope: __scopeCheckbox,
      ...context,
      children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
    }
  );
}
var TRIGGER_NAME = "CheckboxTrigger";
var CheckboxTrigger = reactExports.forwardRef(
  ({ __scopeCheckbox, onKeyDown, onClick, ...checkboxProps }, forwardedRef) => {
    const {
      control,
      value,
      disabled,
      checked,
      required,
      setControl,
      setChecked,
      hasConsumerStoppedPropagationRef,
      isFormControl,
      bubbleInput
    } = useCheckboxContext(TRIGGER_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs(forwardedRef, setControl);
    const initialCheckedStateRef = reactExports.useRef(checked);
    reactExports.useEffect(() => {
      const form = control?.form;
      if (form) {
        const reset = () => setChecked(initialCheckedStateRef.current);
        form.addEventListener("reset", reset);
        return () => form.removeEventListener("reset", reset);
      }
    }, [control, setChecked]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "checkbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        "aria-required": required,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...checkboxProps,
        ref: composedRefs,
        onKeyDown: composeEventHandlers(onKeyDown, (event) => {
          if (event.key === "Enter") event.preventDefault();
        }),
        onClick: composeEventHandlers(onClick, (event) => {
          setChecked((prevChecked) => isIndeterminate(prevChecked) ? true : !prevChecked);
          if (bubbleInput && isFormControl) {
            hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
          }
        })
      }
    );
  }
);
CheckboxTrigger.displayName = TRIGGER_NAME;
var Checkbox$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCheckbox,
      name,
      checked,
      defaultChecked,
      required,
      disabled,
      value,
      onCheckedChange,
      form,
      ...checkboxProps
    } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CheckboxProvider,
      {
        __scopeCheckbox,
        checked,
        defaultChecked,
        disabled,
        required,
        onCheckedChange,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxTrigger,
            {
              ...checkboxProps,
              ref: forwardedRef,
              __scopeCheckbox
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxBubbleInput,
            {
              __scopeCheckbox
            }
          )
        ] })
      }
    );
  }
);
Checkbox$1.displayName = CHECKBOX_NAME;
var INDICATOR_NAME = "CheckboxIndicator";
var CheckboxIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
    const context = useCheckboxContext(INDICATOR_NAME, __scopeCheckbox);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Presence,
      {
        present: forceMount || isIndeterminate(context.checked) || context.checked === true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            "data-state": getState(context.checked),
            "data-disabled": context.disabled ? "" : void 0,
            ...indicatorProps,
            ref: forwardedRef,
            style: { pointerEvents: "none", ...props.style }
          }
        )
      }
    );
  }
);
CheckboxIndicator.displayName = INDICATOR_NAME;
var BUBBLE_INPUT_NAME = "CheckboxBubbleInput";
var CheckboxBubbleInput = reactExports.forwardRef(
  ({ __scopeCheckbox, ...props }, forwardedRef) => {
    const {
      control,
      hasConsumerStoppedPropagationRef,
      checked,
      defaultChecked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput
    } = useCheckboxContext(BUBBLE_INPUT_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = bubbleInput;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      const bubbles = !hasConsumerStoppedPropagationRef.current;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        input.indeterminate = isIndeterminate(checked);
        setChecked.call(input, isIndeterminate(checked) ? false : checked);
        input.dispatchEvent(event);
      }
    }, [bubbleInput, prevChecked, checked, hasConsumerStoppedPropagationRef]);
    const defaultCheckedRef = reactExports.useRef(isIndeterminate(checked) ? false : checked);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: defaultChecked ?? defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
CheckboxBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
  return typeof value === "function";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
function TasksPage() {
  const {
    user
  } = useAuth();
  const userId = user.id;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [newSubjectId, setNewSubjectId] = reactExports.useState("");
  const [filterSubject, setFilterSubject] = reactExports.useState("all");
  const [showCompleted, setShowCompleted] = reactExports.useState(false);
  const {
    data: subjects = []
  } = useQuery({
    queryKey: ["subjects", userId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("subjects").select("*").order("created_at", {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });
  reactExports.useEffect(() => {
    if (!newSubjectId && subjects.length > 0) setNewSubjectId(subjects[0].id);
  }, [subjects, newSubjectId]);
  const {
    data: todos = [],
    isLoading
  } = useQuery({
    queryKey: ["todos", userId, "all"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("todos").select("*").order("completed", {
        ascending: true
      }).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  const subjectMap = reactExports.useMemo(() => {
    const m = {};
    subjects.forEach((s) => m[s.id] = s);
    return m;
  }, [subjects]);
  const filtered = reactExports.useMemo(() => {
    return todos.filter((t) => {
      if (filterSubject !== "all" && t.subject_id !== filterSubject) return false;
      if (!showCompleted && t.completed) return false;
      return true;
    });
  }, [todos, filterSubject, showCompleted]);
  const addTodo = useMutation({
    mutationFn: async () => {
      if (!newSubjectId) throw new Error("Pick a subject first");
      const {
        error
      } = await supabase.from("todos").insert({
        user_id: userId,
        title: newTitle.trim(),
        subject_id: newSubjectId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle("");
      qc.invalidateQueries({
        queryKey: ["todos"]
      });
      qc.invalidateQueries({
        queryKey: ["subject-stats", userId]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const toggle = useMutation({
    mutationFn: async (t) => {
      const {
        error
      } = await supabase.from("todos").update({
        completed: !t.completed,
        completed_at: !t.completed ? (/* @__PURE__ */ new Date()).toISOString() : null
      }).eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["todos"]
      });
      qc.invalidateQueries({
        queryKey: ["subject-stats", userId]
      });
    }
  });
  const remove = useMutation({
    mutationFn: async (id) => {
      const {
        error
      } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["todos"]
      });
      qc.invalidateQueries({
        queryKey: ["subject-stats", userId]
      });
    }
  });
  const rename = useMutation({
    mutationFn: async ({
      id,
      title
    }) => {
      const {
        error
      } = await supabase.from("todos").update({
        title
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["todos"]
    })
  });
  const reassign = useMutation({
    mutationFn: async ({
      id,
      subject_id
    }) => {
      const {
        error
      } = await supabase.from("todos").update({
        subject_id
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["todos"]
      });
      qc.invalidateQueries({
        queryKey: ["subject-stats", userId]
      });
    }
  });
  const startSession = useMutation({
    mutationFn: async (todo) => {
      const {
        data,
        error
      } = await supabase.from("study_sessions").insert({
        user_id: userId,
        subject_id: todo.subject_id,
        todo_id: todo.id,
        task_title: todo.title,
        started_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (sessionId) => navigate({
      to: "/focus/$sessionId",
      params: {
        sessionId
      }
    }),
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Tasks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "All your to-dos across every subject." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      if (newTitle.trim()) addTodo.mutate();
    }, className: "flex flex-col gap-2 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: "Add a task…", className: "h-11 flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newSubjectId, onValueChange: setNewSubjectId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-11 sm:w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Subject" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: subjects.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: {
            backgroundColor: s.color_code
          } }),
          s.name
        ] }) }, s.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", size: "lg", disabled: !newTitle.trim() || !newSubjectId || addTodo.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 hidden sm:inline", children: "Add" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterSubject, onValueChange: setFilterSubject, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All subjects" }),
          subjects.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: {
              backgroundColor: s.color_code
            } }),
            s.name
          ] }) }, s.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: showCompleted, onCheckedChange: (v) => setShowCompleted(!!v) }),
        "Show completed"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No tasks to show." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: filtered.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(TodoRow, { todo: t, subject: t.subject_id ? subjectMap[t.subject_id] : void 0, subjects, onToggle: () => toggle.mutate(t), onDelete: () => remove.mutate(t.id), onRename: (title) => rename.mutate({
      id: t.id,
      title
    }), onReassign: (sid) => reassign.mutate({
      id: t.id,
      subject_id: sid
    }), onStart: () => startSession.mutate(t), starting: startSession.isPending }, t.id)) })
  ] });
}
function TodoRow({
  todo,
  subject,
  subjects,
  onToggle,
  onDelete,
  onRename,
  onReassign,
  onStart,
  starting
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState(todo.title);
  reactExports.useEffect(() => setDraft(todo.title), [todo.title]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `flex flex-wrap items-center gap-3 p-3 ${todo.completed ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: todo.completed, onCheckedChange: onToggle, className: "h-5 w-5" }),
    editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft, onChange: (e) => setDraft(e.target.value), className: "h-9", autoFocus: true, onKeyDown: (e) => {
        if (e.key === "Enter") {
          onRename(draft.trim() || todo.title);
          setEditing(false);
        }
        if (e.key === "Escape") setEditing(false);
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
        onRename(draft.trim() || todo.title);
        setEditing(false);
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex-1 text-sm ${todo.completed ? "line-through" : ""}`, children: todo.title }),
    !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: todo.subject_id ?? "", onValueChange: onReassign, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-36 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { children: subject ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full", style: {
          backgroundColor: subject.color_code
        } }),
        subject.name
      ] }) : "—" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: subjects.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: {
          backgroundColor: s.color_code
        } }),
        s.name
      ] }) }, s.id)) })
    ] }),
    !editing && !todo.completed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onStart, disabled: starting, size: "sm", className: "gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" }),
      " Focus"
    ] }),
    !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setEditing(true), "aria-label": "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: onDelete, "aria-label": "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] })
  ] }) });
}
export {
  TasksPage as component
};
