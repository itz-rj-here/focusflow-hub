import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-B_bFK5W9.js";
import { u as useAuth, b as useQueryClient, a as useNavigate, t as toast, s as supabase } from "./router-DcQ90zo1.js";
import { u as useQuery } from "./useQuery-CYnMj1bC.js";
import { u as useMutation } from "./useMutation-BEZKWd8V.js";
import { B as Button } from "./button-D2sQIMTR.js";
import { I as Input } from "./input-DU-Kk94e.js";
import { C as Checkbox } from "./checkbox-BItfuwie.js";
import { C as Card } from "./card-WsLkobih.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-C15SNRmK.js";
import { c as createLucideIcon } from "./createLucideIcon-DkotJOnA.js";
import { P as Plus } from "./plus-pSHZqa53.js";
import { C as Check } from "./check-DRO1xls3.js";
import { X } from "./x-8WYNGZSc.js";
import { P as Play } from "./play-C7r6Frk9.js";
import { P as Pencil } from "./pencil-BqNUS8Co.js";
import { T as Trash2 } from "./trash-2-D6ImQK0N.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CCoPBkcz.js";
import "./index-CAnTiw_Z.js";
import "./index-DyemRUqI.js";
import "./index-BxmJQFlE.js";
import "./index-cWnnIzgt.js";
import "./index-jOe9Su3m.js";
const __iconNode$1 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528",
      key: "1jaruq"
    }
  ]
];
const Flag = createLucideIcon("flag", __iconNode);
const PRIORITY_LABELS = {
  1: {
    label: "Low",
    color: "text-green-500"
  },
  2: {
    label: "Medium",
    color: "text-yellow-500"
  },
  3: {
    label: "High",
    color: "text-red-500"
  }
};
function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date((/* @__PURE__ */ new Date()).toDateString());
}
function formatDueDate(dueDate) {
  if (!dueDate) return "";
  const date = new Date(dueDate);
  const today = new Date((/* @__PURE__ */ new Date()).toDateString());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric"
  });
}
function TasksPage() {
  const {
    user
  } = useAuth();
  const userId = user.id;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [newSubjectId, setNewSubjectId] = reactExports.useState("");
  const [newPriority, setNewPriority] = reactExports.useState(2);
  const [newDueDate, setNewDueDate] = reactExports.useState("");
  const [filterSubject, setFilterSubject] = reactExports.useState("all");
  const [showCompleted, setShowCompleted] = reactExports.useState(false);
  const [sortBy, setSortBy] = reactExports.useState("created_at");
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
    let result = todos.filter((t) => {
      if (filterSubject !== "all" && t.subject_id !== filterSubject) return false;
      if (!showCompleted && t.completed) return false;
      return true;
    });
    if (sortBy === "priority") {
      result = [...result].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    } else if (sortBy === "due_date") {
      result = [...result].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    }
    return result;
  }, [todos, filterSubject, showCompleted, sortBy]);
  const addTodo = useMutation({
    mutationFn: async () => {
      if (!newSubjectId) throw new Error("Pick a subject first");
      const {
        error
      } = await supabase.from("todos").insert({
        user_id: userId,
        title: newTitle.trim(),
        subject_id: newSubjectId,
        priority: newPriority,
        due_date: newDueDate || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTitle("");
      setNewPriority(2);
      setNewDueDate("");
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
  const updatePriority = useMutation({
    mutationFn: async ({
      id,
      priority
    }) => {
      const {
        error
      } = await supabase.from("todos").update({
        priority
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["todos"]
    })
  });
  const updateDueDate = useMutation({
    mutationFn: async ({
      id,
      due_date
    }) => {
      const {
        error
      } = await supabase.from("todos").update({
        due_date
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["todos"]
    })
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
    }, className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newTitle, onChange: (e) => setNewTitle(e.target.value), placeholder: "Add a task…", className: "h-11 flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: newSubjectId, onValueChange: setNewSubjectId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-11 sm:w-44", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Subject" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: subjects.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full", style: {
              backgroundColor: s.color_code
            } }),
            s.name
          ] }) }, s.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(newPriority), onValueChange: (v) => setNewPriority(Number(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-32", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Priority" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-green-500" }),
              "Low"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-yellow-500" }),
              "Medium"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-red-500" }),
              "High"
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: newDueDate, onChange: (e) => setNewDueDate(e.target.value), className: "h-9 w-40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", size: "lg", disabled: !newTitle.trim() || !newSubjectId || addTodo.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 hidden sm:inline", children: "Add" })
        ] })
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sortBy, onValueChange: (v) => setSortBy(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9 w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sort by" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "created_at", children: "Newest first" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "priority", children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "due_date", children: "Due date" })
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
    }), onUpdatePriority: (p) => updatePriority.mutate({
      id: t.id,
      priority: p
    }), onUpdateDueDate: (d) => updateDueDate.mutate({
      id: t.id,
      due_date: d
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
  onUpdatePriority,
  onUpdateDueDate,
  onStart,
  starting
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState(todo.title);
  const [showDueDatePicker, setShowDueDatePicker] = reactExports.useState(false);
  reactExports.useEffect(() => setDraft(todo.title), [todo.title]);
  const priorityConfig = PRIORITY_LABELS[todo.priority] || PRIORITY_LABELS[2];
  const overdue = isOverdue(todo.due_date);
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
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm ${todo.completed ? "line-through" : ""}`, children: todo.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(todo.priority ?? 2), onValueChange: (v) => onUpdatePriority(Number(v)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-6 w-6 p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: `h-3.5 w-3.5 ${priorityConfig.color}` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-green-500" }),
            " Low"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-yellow-500" }),
            " Medium"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "h-3.5 w-3.5 text-red-500" }),
            " High"
          ] }) })
        ] })
      ] }),
      todo.due_date ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowDueDatePicker(true), className: `inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs ${overdue && !todo.completed ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-muted text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
        formatDueDate(todo.due_date)
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowDueDatePicker(true), className: "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
        "Set due date"
      ] }),
      showDueDatePicker && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: todo.due_date ?? "", onChange: (e) => {
          onUpdateDueDate(e.target.value || null);
          setShowDueDatePicker(false);
        }, className: "h-6 w-32 text-xs", autoFocus: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6", onClick: () => {
          onUpdateDueDate(null);
          setShowDueDatePicker(false);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
      ] })
    ] }),
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
