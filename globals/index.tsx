export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
    priority: 'Low' | 'Medium' | 'High';
    createdAt: Date;
  }
  
  export type Filter = 'All' | 'Pending' | 'Completed';
  export type SortBy = 'createdAt' | 'dueDate' | 'priority';
  export type SortOrder = 'asc' | 'desc';

  
