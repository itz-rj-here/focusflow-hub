-- Add priority and due_date to todos
-- This enables users to prioritize tasks and set deadlines

-- Add priority column (1=low, 2=medium, 3=high)
ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS priority integer not null default 2;

-- Add due_date column
ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS due_date date;

-- Create index for faster filtering by due_date
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);

-- Create index for faster sorting by priority
CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.todos(priority);