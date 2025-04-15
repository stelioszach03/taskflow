import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TaskList from '../components/Tasks/TaskList';
import TaskDetail from '../components/Tasks/TaskDetail';
import TaskForm from '../components/Tasks/TaskForm';

const TasksPage = () => {
  return (
    <Routes>
      <Route index element={<TaskList />} />
      <Route path=":id" element={<TaskDetail />} />
      <Route path="new" element={<TaskForm />} />
      <Route path="edit/:id" element={<TaskForm />} />
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
};

export default TasksPage;