import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, GripVertical, Sun, Moon, Loader, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAppStore } from '../../stores/useAppStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

interface Task {
  id: string;
  title: string;
  description: string;
  column: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  position: number;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

interface Column {
  id: 'todo' | 'inprogress' | 'done';
  title: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-slate-700 dark:bg-slate-700' },
  { id: 'done', title: 'Done', color: 'bg-slate-800 dark:bg-slate-800' }
];

const PRIORITY_COLORS = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500'
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resizingTask, setResizingTask] = useState<string | null>(null);
  const [pendingCreationTaskId, setPendingCreationTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  
  const { theme, toggleTheme } = useAppStore();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const isDarkMode = theme === 'dark';

  // Load tasks from Supabase
  const loadTasks = async () => {
    if (!user || !isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading tasks:', error);
        setError('Failed to load tasks');
        toast.error('Failed to load tasks', error.message);
        return;
      }

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        column: task.task_column,
        priority: task.priority,
        position: task.position,
        width: task.width,
        height: task.height,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
      toast.error('Failed to load tasks', 'Please try refreshing the page');
    } finally {
      setLoading(false);
    }
  };

  // Save task to Supabase
  const saveTask = async (task: Partial<Task> & { id?: string }) => {
    if (!user || !isAuthenticated) return null;

    try {
      setSaving(true);

      if (task.id) {
        // Update existing task
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: task.title,
            description: task.description,
            task_column: task.column,
            priority: task.priority,
            position: task.position,
            width: task.width,
            height: task.height,
          })
          .eq('id', task.id)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();

        if (error) {
          console.error('Error updating task:', error);
          toast.error('Failed to update task', error.message);
          return null;
        }

        if (!data) {
          console.error('No task found to update');
          toast.error('Failed to update task', 'Task not found');
          return null;
        }

        return data;
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: task.title || 'New Task',
            description: task.description || '',
            task_column: task.column || 'todo',
            priority: task.priority || 'medium',
            position: task.position || 0,
            width: task.width || 280,
            height: task.height || 120,
          })
          .select();

        if (error) {
          console.error('Error creating task:', error);
          toast.error('Failed to create task', error.message);
          return null;
        }

        if (!data || data.length === 0) {
          console.error('No data returned from insert');
          toast.error('Failed to create task', 'No data returned');
          return null;
        }

        return data[0];
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task', 'Please try again');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Delete task from Supabase
  const deleteTaskFromDB = async (taskId: string) => {
    if (!user || !isAuthenticated) return false;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task', 'Please try again');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Initialize tasks when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const generateId = () => crypto.randomUUID();

  const createTask = async (column: 'todo' | 'inprogress' | 'done') => {
    const columnTasks = tasks.filter(t => t.column === column);
    const position = columnTasks.length;

    const newTaskData = {
      title: 'New Task',
      description: '',
      column,
      priority: 'medium' as const,
      position,
      width: 280,
      height: 120,
    };

    // Optimistically add to UI
    const tempId = generateId();
    const tempTask: Task = {
      id: tempId,
      ...newTaskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => [...prev, tempTask]);
    setEditingTask(tempId);
    setEditingField('title');
    setPendingCreationTaskId(tempId);

    // Save to database
    const savedTask = await saveTask(newTaskData);
    if (savedTask) {
      // Replace temp task with real task
      setTasks(prev => prev.map(task => 
        task.id === tempId 
          ? {
              id: savedTask.id,
              title: savedTask.title,
              description: savedTask.description,
              column: savedTask.column,
              priority: savedTask.priority,
              position: savedTask.position,
              width: savedTask.width,
              height: savedTask.height,
              createdAt: savedTask.created_at,
              updatedAt: savedTask.updated_at,
            }
          : task
      ));
      setEditingTask(savedTask.id);
      setPendingCreationTaskId(null);
    } else {
      // Remove temp task if save failed
      setTasks(prev => prev.filter(task => task.id !== tempId));
      setEditingTask(null);
      setEditingField(null);
      setPendingCreationTaskId(null);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Skip database save if task is still being created
    if (taskId === pendingCreationTaskId) {
      // Only update local state for pending tasks
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ));
      return;
    }

    // Optimistically update UI
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));

    // Save to database
    const updatedTask = tasks.find(t => t.id === taskId);
    if (updatedTask) {
      const result = await saveTask({ ...updatedTask, ...updates, id: taskId });
      
      // If save failed (task not found in database), remove from local state
      if (result === null) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        toast.error('Task not found', 'Task has been removed from your board');
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    const success = await deleteTaskFromDB(taskId);
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted', 'Task has been successfully deleted');
    }
    setDeleteConfirm(null);
  };

  const moveTask = async (taskId: string, newColumn: 'todo' | 'inprogress' | 'done', newPosition: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Calculate new positions for all affected tasks
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, column: newColumn, position: newPosition };
      }
      
      // Adjust positions in old column
      if (t.column === task.column && t.position > task.position) {
        return { ...t, position: t.position - 1 };
      }
      
      // Adjust positions in new column
      if (t.column === newColumn && t.position >= newPosition) {
        return { ...t, position: t.position + 1 };
      }
      
      return t;
    });

    setTasks(updatedTasks);

    // Save the moved task to database
    await saveTask({ ...task, column: newColumn, position: newPosition, id: taskId });
  };

  const cyclePriority = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    
    await updateTask(taskId, { priority: nextPriority });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    if (dragPreviewRef.current) {
      e.dataTransfer.setDragImage(dragPreviewRef.current, 0, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, column: 'todo' | 'inprogress' | 'done') => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask) return;

    const columnTasks = tasks.filter(t => t.column === column);
    const newPosition = columnTasks.length;
    
    await moveTask(draggedTask.id, column, newPosition);
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setResizingTask(taskId);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: task.width,
      height: task.height
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;
      
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      
      const newWidth = Math.max(200, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(100, resizeStartRef.current.height + deltaY);
      
      updateTask(taskId, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setResizingTask(null);
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Edit handlers
  const handleEditStart = (taskId: string, field: 'title' | 'description') => {
    setEditingTask(taskId);
    setEditingField(field);
  };

  const handleEditEnd = () => {
    setEditingTask(null);
    setEditingField(null);
  };

  const handleKeyDown = async (e: React.KeyboardEvent, taskId: string, field: 'title' | 'description', value: string) => {
    if (e.key === 'Enter' && field === 'title') {
      await updateTask(taskId, { [field]: value });
      handleEditEnd();
    } else if (e.key === 'Escape') {
      handleEditEnd();
    }
  };

  const getTasksByColumn = (column: string) => {
    return tasks
      .filter(task => task.column === column)
      .sort((a, b) => a.position - b.position);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Loading Task Board</h3>
            <p className="text-slate-600 dark:text-slate-400">Getting your tasks ready...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Failed to Load Tasks</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <Button onClick={loadTasks}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-200", isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50")}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Task Board</h1>
            <p className="text-slate-600 dark:text-gray-400">Organize your work with drag-and-drop simplicity</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {saving && (
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            <Button
              variant="ghost"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByColumn(column.id);
            
            return (
              <div
                key={column.id}
                className={cn(
                  "rounded-2xl p-6 min-h-[600px] transition-all duration-200 shadow-sm border",
                  column.id === 'todo' && "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                  column.id === 'inprogress' && "bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                  column.id === 'done' && "bg-gradient-to-br from-emerald-50 to-green-50 dark:bg-green-900/20 border-emerald-200 dark:border-green-800",
                  dragOverColumn === column.id && "ring-2 ring-primary-400 ring-opacity-50 shadow-lg"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      column.id === 'todo' && "bg-slate-400",
                      column.id === 'inprogress' && "bg-blue-500",
                      column.id === 'done' && "bg-emerald-500"
                    )} />
                    <h2 className="font-semibold text-slate-900 dark:text-white text-lg">
                      {column.title}
                    </h2>
                    <span className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-medium",
                      column.id === 'todo' && "bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300",
                      column.id === 'inprogress' && "bg-white text-slate-700",
                      column.id === 'done' && "bg-white text-slate-700"
                    )}>
                      {columnTasks.length}
                    </span>
                  </div>
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    size="sm"
                    onClick={() => createTask(column.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      column.id === 'todo' && "hover:bg-slate-100 dark:hover:bg-gray-800/50",
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    disabled={saving}
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                {/* Tasks */}
                <div className="space-y-4">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 dark:text-gray-400">
                      <div className="text-5xl mb-3 opacity-50">📝</div>
                      <p className="text-sm">No tasks yet</p>
                      <p className="text-xs opacity-75">Click + to add one</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "bg-white dark:bg-gray-800 rounded-xl shadow-sm border cursor-move transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative group",
                          "border-slate-200 dark:border-gray-700",
                          task.column === 'done' && "opacity-75 bg-slate-50 dark:bg-gray-800",
                          draggedTask?.id === task.id && "opacity-50 rotate-2 scale-105 shadow-xl"
                        )}
                        style={{
                          width: task.width,
                          height: task.height,
                          minWidth: 200,
                          minHeight: 100
                        }}
                      >
                        {/* Task Content */}
                        <div className="p-4 h-full flex flex-col">
                          {/* Header with priority and actions */}
                          <div className="flex items-start justify-between mb-3">
                            <button
                              onClick={() => cyclePriority(task.id)}
                              className={cn(
                                "w-3 h-3 rounded-full transition-all duration-200 hover:scale-125 shadow-sm",
                                PRIORITY_COLORS[task.priority]
                              )}
                              title={`Priority: ${PRIORITY_LABELS[task.priority]} (click to change)`}
                            />
                            
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {task.column === 'done' && (
                                <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-1">
                                  <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(task.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 rounded-lg transition-all duration-200"
                                disabled={saving}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </div>

                          {/* Title */}
                          <div className="mb-3">
                            {editingTask === task.id && editingField === 'title' ? (
                              <input
                                type="text"
                                defaultValue={task.title}
                                autoFocus
                                onBlur={async (e) => {
                                  await updateTask(task.id, { title: e.target.value });
                                  handleEditEnd();
                                }}
                                onKeyDown={(e) => handleKeyDown(e, task.id, 'title', e.currentTarget.value)}
                                className="w-full bg-transparent border-none outline-none font-semibold text-slate-900 dark:text-white resize-none"
                              />
                            ) : (
                              <h3
                                onClick={() => handleEditStart(task.id, 'title')}
                                className="font-semibold text-slate-900 dark:text-white cursor-text hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg px-2 py-1 -mx-2 -my-1 transition-all duration-200"
                              >
                                {task.title}
                              </h3>
                            )}
                          </div>

                          {/* Description */}
                          <div className="flex-1">
                            {editingTask === task.id && editingField === 'description' ? (
                              <textarea
                                defaultValue={task.description}
                                autoFocus
                                onBlur={async (e) => {
                                  await updateTask(task.id, { description: e.target.value });
                                  handleEditEnd();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') handleEditEnd();
                                }}
                                className="w-full h-full bg-transparent border-none outline-none text-sm text-slate-600 dark:text-gray-300 resize-none overflow-hidden"
                                placeholder="Add description..."
                              />
                            ) : (
                              <p
                                onClick={() => handleEditStart(task.id, 'description')}
                                className="text-sm text-slate-600 dark:text-gray-300 cursor-text hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg px-2 py-1 -mx-2 -my-1 transition-all duration-200 h-full overflow-hidden leading-relaxed line-clamp-3"
                              >
                                {task.description || <span className="opacity-50">Add description...</span>}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Resize Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, task.id)}
                          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-tl-lg"
                        >
                          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-r-2 border-b-2 border-slate-400 dark:border-gray-500" />
                        </div>

                        {/* Drag Handle */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-move hover:bg-slate-100 dark:hover:bg-gray-700 rounded p-1">
                          <GripVertical size={14} className="text-slate-400 dark:text-gray-500" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Delete Task
            </h3>
            <p className="text-slate-600 dark:text-gray-300 mb-6 leading-relaxed">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border-slate-300 hover:bg-slate-50"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteTask(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={saving}
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden drag preview */}
      <div
        ref={dragPreviewRef}
        className="fixed -top-1000 -left-1000 pointer-events-none opacity-90 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-slate-200 dark:border-gray-700"
      >
        {draggedTask && (
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{draggedTask.title}</h3>
            <p className="text-sm text-slate-600 dark:text-gray-300 truncate">
              {draggedTask.description || 'No description'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};