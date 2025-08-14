import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Check, GripVertical, MoreHorizontal, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../utils/cn';

interface Task {
  id: string;
  title: string;
  description: string;
  column: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  position: number;
  createdAt: string;
  updatedAt: string;
  width?: number;
  height?: number;
}

interface Column {
  id: 'todo' | 'inprogress' | 'done';
  title: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' }
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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'description' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resizingTask, setResizingTask] = useState<string | null>(null);
  
  const dragPreviewRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Use app theme instead of local theme state
  const { theme, toggleTheme } = useAppStore();
  const isDarkMode = theme === 'dark';

  // Initialize from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('kanban-tasks');
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const generateId = () => crypto.randomUUID();

  const createTask = (column: 'todo' | 'inprogress' | 'done') => {
    const newTask: Task = {
      id: generateId(),
      title: 'New Task',
      description: '',
      column,
      priority: 'medium',
      position: tasks.filter(t => t.column === column).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      width: 280,
      height: 120
    };
    
    setTasks(prev => [...prev, newTask]);
    setEditingTask(newTask.id);
    setEditingField('title');
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setDeleteConfirm(null);
  };

  const moveTask = (taskId: string, newColumn: 'todo' | 'inprogress' | 'done', newPosition: number) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;

      // Remove task from current position
      const withoutTask = prev.filter(t => t.id !== taskId);
      
      // Adjust positions in old column
      const adjustedTasks = withoutTask.map(t => 
        t.column === task.column && t.position > task.position
          ? { ...t, position: t.position - 1 }
          : t
      );

      // Adjust positions in new column
      const finalTasks = adjustedTasks.map(t => 
        t.column === newColumn && t.position >= newPosition
          ? { ...t, position: t.position + 1 }
          : t
      );

      // Add task to new position
      const updatedTask = {
        ...task,
        column: newColumn,
        position: newPosition,
        updatedAt: new Date().toISOString()
      };

      return [...finalTasks, updatedTask];
    });
  };

  const cyclePriority = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    
    updateTask(taskId, { priority: nextPriority });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    // Create custom drag preview
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

  const handleDrop = (e: React.DragEvent, column: 'todo' | 'inprogress' | 'done') => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask) return;

    const columnTasks = tasks.filter(t => t.column === column);
    const newPosition = columnTasks.length;
    
    moveTask(draggedTask.id, column, newPosition);
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
      width: task.width || 280,
      height: task.height || 120
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

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string, field: 'title' | 'description', value: string) => {
    if (e.key === 'Enter' && field === 'title') {
      updateTask(taskId, { [field]: value });
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

  return (
    <div className={cn("min-h-screen transition-colors duration-200", isDarkMode ? "bg-gray-900" : "bg-gray-50")}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h1>
            <p className="text-gray-600 dark:text-gray-400">Organize your work with drag-and-drop simplicity</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByColumn(column.id);
            
            return (
              <div
                key={column.id}
                className={cn(
                  "rounded-xl p-4 min-h-[600px] transition-all duration-200",
                  column.color,
                  dragOverColumn === column.id && "ring-2 ring-blue-500 ring-opacity-50"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {column.title}
                    </h2>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => createTask(column.id)}
                    className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="text-sm">No tasks yet</p>
                      <p className="text-xs">Click + to add one</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-move transition-all duration-200 hover:shadow-md relative group",
                          task.column === 'done' && "opacity-50",
                          draggedTask?.id === task.id && "opacity-50 rotate-2 scale-105"
                        )}
                        style={{
                          width: task.width || 280,
                          height: task.height || 120,
                          minWidth: 200,
                          minHeight: 100
                        }}
                      >
                        {/* Task Content */}
                        <div className="p-3 h-full flex flex-col">
                          {/* Header with priority and actions */}
                          <div className="flex items-start justify-between mb-2">
                            <button
                              onClick={() => cyclePriority(task.id)}
                              className={cn(
                                "w-3 h-3 rounded-full transition-colors duration-200",
                                PRIORITY_COLORS[task.priority]
                              )}
                              title={`Priority: ${PRIORITY_LABELS[task.priority]} (click to change)`}
                            />
                            
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {task.column === 'done' && (
                                <Check size={14} className="text-green-500" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(task.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </div>

                          {/* Title */}
                          <div className="mb-2">
                            {editingTask === task.id && editingField === 'title' ? (
                              <input
                                type="text"
                                defaultValue={task.title}
                                autoFocus
                                onBlur={(e) => {
                                  updateTask(task.id, { title: e.target.value });
                                  handleEditEnd();
                                }}
                                onKeyDown={(e) => handleKeyDown(e, task.id, 'title', e.currentTarget.value)}
                                className="w-full bg-transparent border-none outline-none font-medium text-gray-900 dark:text-white resize-none"
                              />
                            ) : (
                              <h3
                                onClick={() => handleEditStart(task.id, 'title')}
                                className="font-medium text-gray-900 dark:text-white cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1 transition-colors"
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
                                onBlur={(e) => {
                                  updateTask(task.id, { description: e.target.value });
                                  handleEditEnd();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') handleEditEnd();
                                }}
                                className="w-full h-full bg-transparent border-none outline-none text-sm text-gray-600 dark:text-gray-300 resize-none"
                                placeholder="Add description..."
                              />
                            ) : (
                              <p
                                onClick={() => handleEditStart(task.id, 'description')}
                                className="text-sm text-gray-600 dark:text-gray-300 cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 -mx-1 transition-colors h-full overflow-hidden"
                              >
                                {task.description || 'Add description...'}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Resize Handle */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, task.id)}
                          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400 dark:border-gray-500" />
                        </div>

                        {/* Drag Handle */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                          <GripVertical size={14} className="text-gray-400 dark:text-gray-500" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Task
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteTask(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden drag preview */}
      <div
        ref={dragPreviewRef}
        className="fixed -top-1000 -left-1000 pointer-events-none opacity-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700"
      >
        {draggedTask && (
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{draggedTask.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {draggedTask.description || 'No description'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};