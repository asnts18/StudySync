import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-8 py-16">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold mb-6">Find your perfect study group</h1>
            <p className="text-xl mb-8">
              Connect with fellow students, share knowledge, and ace your classes together.
              StudySync makes it easy to find or create the ideal study group.
            </p>
            <div className="flex gap-4">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 border-2 border-black hover:bg-gray-100 transition-colors text-xl"
              >
                Log In
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="border-2 border-black p-6 bg-gray-50">
              <img 
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Students studying together" 
                className="w-full border-2 border-black"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Why StudySync?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-2 border-black p-6">
              <h3 className="text-xl font-bold mb-3">Find Study Groups</h3>
              <p>
                Search for study groups within your university by course, subject, or keywords. Filter by tags to find the perfect match for your study style.
              </p>
            </div>
            <div className="border-2 border-black p-6">
              <h3 className="text-xl font-bold mb-3">Create Your Own</h3>
              <p>
                Can't find what you're looking for? Create your own study group in minutes and invite classmates to join.
              </p>
            </div>
            <div className="border-2 border-black p-6">
              <h3 className="text-xl font-bold mb-3">Boost Your Grades</h3>
              <p>
                Research shows that studying in groups improves retention and understanding. Connect with peers and excel together.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to join?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create your account today and start connecting with fellow students who share your academic goals.
          </p>
          <Link 
            to="/register" 
            className="inline-block px-8 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl"
          >
            Sign Up Now
          </Link>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;