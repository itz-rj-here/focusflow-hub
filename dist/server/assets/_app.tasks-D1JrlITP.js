import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-RQlX2Pcr.js";
import { u as useAuth, b as useQueryClient, a as useNavigate, t as toast, s as supabase } from "./router-DjUwB7c9.js";
import { u as useQuery } from "./useQuery-CLER0c11.js";
import { u as useMutation } from "./useMutation-C7tbtrRM.js";
import { B as Button } from "./createLucideIcon-Dbr3Sw-K.js";
import { I as Input, C as Check } from "./input-C091OJdU.js";
import { C as Checkbox } from "./checkbox-IzcxBf1f.js";
import { C as Card } from "./card-D0kQ7RYH.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-D5xT750M.js";
import { P as Plus } from "./plus-B0VaEAW8.js";
import { X } from "./x-DxHbxZWx.js";
import { P as Play } from "./play-0-fa0jL5.js";
import { P as Pencil } from "./pencil-BairwjDh.js";
import { T as Trash2 } from "./trash-2-CUjjzCbg.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils-yyGTFsPO.js";
import "./index-DFXycfMV.js";
import "./index-DsW1k7xg.js";
import "./index-DcrbZ2IH.js";
import "./index-CKiysB-v.js";
import "./index-Bv9rL0xp.js";
import "./index-DvAOGsH7.js";
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
