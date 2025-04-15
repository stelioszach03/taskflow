import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Common/Loader';
import Alert from '../components/Common/Alert';
import api from '../services/api';

const TeamPage = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Load team members on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      try {
        // Get all users who have tasks in common with the current user
        const response = await api.get('/tasks?limit=100');
        const tasks = response.data.tasks;
        
        // Extract all unique user IDs from tasks (creator and assignees)
        const userIds = new Set();
        
        tasks.forEach(task => {
          if (task.creator?._id) {
            userIds.add(task.creator._id);
          }
          
          if (task.assignedTo && task.assignedTo.length > 0) {
            task.assignedTo.forEach(assignee => {
              if (assignee._id) {
                userIds.add(assignee._id);
              }
            });
          }
        });
        
        // Remove current user from the list
        userIds.delete(user?._id);
        
        // Convert user IDs to array of user objects
        const members = Array.from(userIds).map(userId => {
          // Find the user in task.creator or task.assignedTo
          let member = null;
          
          for (const task of tasks) {
            if (task.creator?._id === userId) {
              member = task.creator;
              break;
            }
            
            if (task.assignedTo && task.assignedTo.length > 0) {
              const assignee = task.assignedTo.find(a => a._id === userId);
              if (assignee) {
                member = assignee;
                break;
              }
            }
          }
          
          return member;
        }).filter(Boolean); // Remove null values
        
        setTeamMembers(members);
      } catch (err) {
        setAlert({
          show: true,
          type: 'error',
          message: 'Failed to load team members'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, [user]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter team members based on search term
  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Team Members</h1>
      </div>

      {(alert.show) && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert({ ...alert, show: false })} 
        />
      )}

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <Loader message="Loading team members..." />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          {filteredMembers.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMembers.map((member) => (
                <li key={member._id} className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{member.name}</h2>
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs font-medium">
                          {member.role === 'admin' ? 'Admin' : 'Team Member'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No team members match your search' : 'No team members found'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPage;