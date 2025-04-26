// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-indigo-100 to-purple-100 px-4 py-16 sm:px-6 sm:py-24">
            <div className="max-w-max mx-auto">
                <main className="sm:flex">
                    <p className="text-5xl font-extrabold text-indigo-600 sm:text-6xl">404</p>
                    <div className="sm:ml-6">
                        <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Page not found</h1>
                            <p className="mt-3 text-base text-gray-500">Sorry, we couldn't find the page you're looking for.</p>
                        </div>
                        <div className="mt-8 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                            <Link
                                to="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Go back home
                            </Link>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Decorative elements */}
                <div className="mt-12 max-w-xl mx-auto">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="h-32 rounded-xl bg-indigo-200 opacity-25"></div>
                        <div className="h-32 rounded-xl bg-purple-200 opacity-25"></div>
                        <div className="h-32 rounded-xl bg-purple-200 opacity-25"></div>
                        <div className="h-32 rounded-xl bg-indigo-200 opacity-25"></div>
                    </div>
                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Lost? Try navigating to one of our main sections or search for what you need.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;