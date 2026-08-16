import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [lifecycleVisible, setLifecycleVisible] = useState(false);
  const heroRef = useRef(null);
  const lifecycleRef = useRef(null);

  useEffect(() => {
    // Hero entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Scroll-triggered lifecycle animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLifecycleVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (lifecycleRef.current) {
      observer.observe(lifecycleRef.current);
    }

    return () => {
      if (lifecycleRef.current) {
        observer.unobserve(lifecycleRef.current);
      }
    };
  }, []);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSubmitCase = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, #1a365d 0%, #2d5a27 100%)`,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s ease-out'
        }}
      >
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#c9a227] animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20">
              <div className="w-12 h-12 bg-[#c9a227] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>G</span>
              </div>
            </div>
            <p className="text-[#c9a227] font-medium tracking-widest uppercase text-sm mb-2">University of Gondar</p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Digital Legal Affairs
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Managing legal cases, scholarship agreements, hearings, and disciplinary matters across all University of Gondar campuses
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <button
              onClick={handleSignIn}
              className="px-8 py-4 bg-[#c9a227] text-white font-semibold rounded-lg hover:bg-[#b8911f] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#c9a227]/50 shadow-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Sign In
            </button>
            <button
              onClick={handleSubmitCase}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Submit a Case
            </button>
          </div>

          {/* Visual moment - stylized legal document illustration */}
          <div className="mt-16 relative">
            <div className="inline-block">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 max-w-md mx-auto">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#c9a227]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#c9a227]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Your case, tracked from start to finish
                    </p>
                    <p className="text-white/70 text-sm">
                      Submit once, follow the progress, get resolution — all in one place
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What This System Handles */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              What This System Handles
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              The Digital Legal Affairs Management System supports the full spectrum of legal matters across the university
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Disciplinary */}
            <div className="bg-[#faf8f5] rounded-2xl p-8 border border-[#1a365d]/10 hover:border-[#1a365d]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-[#1a365d] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1a365d] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Disciplinary Matters
              </h3>
              <p className="text-[#475569] leading-relaxed">
                Student and staff disciplinary cases, from initial reports through hearings and final resolutions, with full documentation and timeline tracking
              </p>
            </div>

            {/* Property */}
            <div className="bg-[#faf8f5] rounded-2xl p-8 border border-[#2d5a27]/10 hover:border-[#2d5a27]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-[#2d5a27] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#2d5a27] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Property & Infrastructure
              </h3>
              <p className="text-[#475569] leading-relaxed">
                University property disputes, infrastructure-related legal matters, and facility use cases with proper documentation and stakeholder coordination
              </p>
            </div>

            {/* Scholarship */}
            <div className="bg-[#faf8f5] rounded-2xl p-8 border border-[#c9a227]/10 hover:border-[#c9a227]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-[#c9a227] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#c9a227] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Scholarship & Sponsorship
              </h3>
              <p className="text-[#475569] leading-relaxed">
                Scholarship agreement management, sponsor coordination, and student support documentation with agreement tracking and compliance monitoring
              </p>
            </div>

            {/* Personal */}
            <div className="bg-[#faf8f5] rounded-2xl p-8 border border-[#475569]/10 hover:border-[#475569]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-[#475569] rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#475569] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Personal Matters
              </h3>
              <p className="text-[#475569] leading-relaxed">
                Individual legal concerns, personal grievances, and confidential matters handled with appropriate privacy and procedural safeguards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Animated Lifecycle */}
      <section 
        ref={lifecycleRef}
        className="py-24 px-6 bg-[#1a365d]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              How It Works
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              A clear process from submission to resolution
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div 
              className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#c9a227] via-[#2d5a27] to-[#c9a227] transform -translate-y-1/2 hidden md:block"
              style={{
                opacity: lifecycleVisible ? 1 : 0,
                transition: 'opacity 1s ease-out 0.5s'
              }}
            ></div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div 
                className="text-center relative"
                style={{
                  opacity: lifecycleVisible ? 1 : 0,
                  transform: lifecycleVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out 0.3s'
                }}
              >
                <div className="w-20 h-20 bg-[#c9a227] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Submit
                </h3>
                <p className="text-white/80">
                  Report your case through the online portal with all relevant details and documentation
                </p>
              </div>

              {/* Step 2 */}
              <div 
                className="text-center relative"
                style={{
                  opacity: lifecycleVisible ? 1 : 0,
                  transform: lifecycleVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out 0.6s'
                }}
              >
                <div className="w-20 h-20 bg-[#2d5a27] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Review & Assign
                </h3>
                <p className="text-white/80">
                  Legal Affairs reviews the case and assigns it to the appropriate officer for handling
                </p>
              </div>

              {/* Step 3 */}
              <div 
                className="text-center relative"
                style={{
                  opacity: lifecycleVisible ? 1 : 0,
                  transform: lifecycleVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out 0.9s'
                }}
              >
                <div className="w-20 h-20 bg-[#c9a227] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Resolution
                </h3>
                <p className="text-white/80">
                  Your assigned officer manages the case through hearings, deadlines, and final resolution
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Every Role */}
      <section className="py-24 px-6 bg-[#faf8f5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Built for Every Role
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Tailored experiences for everyone in the legal process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Reporters */}
            <div className="bg-white rounded-2xl p-6 border border-[#1a365d]/10 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#1a365d] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1a365d] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Reporters
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Submit cases and track their progress through a simple, welcoming interface designed for occasional users
              </p>
            </div>

            {/* Legal Officers */}
            <div className="bg-white rounded-2xl p-6 border border-[#2d5a27]/10 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#2d5a27] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2d5a27] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Legal Officers
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Manage assigned cases with a focused dashboard showing urgent items, hearings, deadlines, and case history
              </p>
            </div>

            {/* Heads */}
            <div className="bg-white rounded-2xl p-6 border border-[#c9a227]/10 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#c9a227] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#c9a227] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Department Heads
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Oversee case assignments, review departmental statistics, and ensure cases are properly distributed
              </p>
            </div>

            {/* Admins */}
            <div className="bg-white rounded-2xl p-6 border border-[#475569]/10 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#475569] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#475569] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Administrators
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Configure the system, manage users and permissions, and oversee all legal operations across campuses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Footer Section */}
      <section className="py-16 px-6 bg-[#1a365d]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#c9a227] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>G</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    University of Gondar
                  </h3>
                  <p className="text-white/70">Legal Affairs Office</p>
                </div>
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                The Digital Legal Affairs Management System is the official platform for managing all legal matters across University of Gondar campuses, ensuring transparency, efficiency, and proper documentation.
              </p>
              <div className="text-white/60 text-sm">
                <p className="mb-2">Contact: legal.affairs@uog.edu.et</p>
                <p>University of Gondar, Ethiopia</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-white/70 mb-4">Ready to get started?</p>
              <button
                onClick={handleSignIn}
                className="px-8 py-4 bg-[#c9a227] text-white font-semibold rounded-lg hover:bg-[#b8911f] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#c9a227]/50 shadow-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Sign In to Your Account
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/50 text-sm">
              © 2026 University of Gondar. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
