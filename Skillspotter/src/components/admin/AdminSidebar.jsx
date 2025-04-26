// src/components/admin/AdminSidebar.jsx
import React from 'react';

const AdminSidebar = ({
                          user,
                          currentSection,
                          setCurrentSection,
                          sidebarOpen,
                          setSidebarOpen,
                          handleLogout
                      }) => {
    return (
        <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white shadow-lg`}>
            <div className="h-full flex flex-col">
                {/* Sidebar header */}
                <div className="px-4 py-6 bg-purple-700 text-white">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">SkillSpotter</h1>
                        <div className="ml-1 px-2 py-1 rounded bg-purple-900 text-xs font-semibold">ADMIN</div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-6 flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-purple-200 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar navigation */}
                <nav className="flex-1 px-2 py-4 bg-white space-y-1 overflow-y-auto">
                    <button
                        onClick={() => setCurrentSection('overview')}
                        className={`w-full flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                            currentSection === 'overview'
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        Overview
                    </button>

                    <button
                        onClick={() => setCurrentSection('job-posting')}
                        className={`w-full flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                            currentSection === 'job-posting'
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Post New Job
                    </button>

                    <button
                        onClick={() => setCurrentSection('jobs')}
                        className={`w-full flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                            currentSection === 'jobs'
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Manage Jobs
                    </button>

                    <button
                        onClick={() => setCurrentSection('users')}
                        className={`w-full flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                            currentSection === 'users'
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                        User Management
                    </button>

                    <button
                        onClick={() => setCurrentSection('analytics')}
                        className={`w-full flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                            currentSection === 'analytics'
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                        Analytics
                    </button>

                    <button
                        onClick={() => setCurrentSection('settings')}
                        className={`w-full flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                            currentSection === 'settings'
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Settings
                    </button>
                </nav>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
                    >
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;