import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [lifecycleVisible, setLifecycleVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const heroRef = useRef(null);
  const lifecycleRef = useRef(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // Hero entrance animation
    if (!prefersReducedMotion) {
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(true);
    }

    // Scroll-triggered lifecycle animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !prefersReducedMotion) {
          setLifecycleVisible(true);
        } else if (prefersReducedMotion) {
          setLifecycleVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (lifecycleRef.current) {
      observer.observe(lifecycleRef.current);
    }

    // Parallax scroll effect (disabled for reduced motion)
    const handleScroll = () => {
      if (!prefersReducedMotion) {
        setScrollY(window.scrollY);
      }
    };

    // Mouse tracking for interactive effects (disabled for reduced motion)
    const handleMouseMove = (e) => {
      if (!prefersReducedMotion) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (lifecycleRef.current) {
        observer.unobserve(lifecycleRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [prefersReducedMotion]);

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
        className="min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, rgba(26, 54, 93, 0.95) 0%, rgba(45, 90, 39, 0.95) 100%), url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.8s ease-out'
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5 animate-pulse"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>

        {/* Floating geometric shapes */}
        <div 
          className="absolute w-64 h-64 rounded-full bg-[#c9a227]/10 blur-3xl"
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-96 h-96 rounded-full bg-[#2d5a27]/10 blur-3xl"
          style={{
            bottom: '10%',
            right: '10%',
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Logo/Brand with animation */}
          <div 
            className="mb-8"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
              transition: 'all 0.8s ease-out 0.2s'
            }}
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 border border-white/20 shadow-2xl hover:scale-110 transition-transform duration-500">
              <div className="w-16 h-16 bg-gradient-to-br from-[#c9a227] to-[#b8911f] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>G</span>
              </div>
            </div>
            <p className="text-[#c9a227] font-medium tracking-widest uppercase text-sm mb-2 animate-pulse">University of Gondar</p>
            <h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6"
              style={{ 
                fontFamily: 'Playfair Display, serif',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out 0.4s'
              }}
            >
              Digital Legal Affairs
            </h1>
            <p 
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease-out 0.6s'
              }}
            >
              Managing legal cases, scholarship agreements, hearings, and disciplinary matters across all University of Gondar campuses
            </p>
          </div>

          {/* CTAs with hover effects */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease-out 0.8s'
            }}
          >
            <button
              onClick={handleSignIn}
              className="group px-8 py-4 bg-gradient-to-r from-[#c9a227] to-[#b8911f] text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#c9a227]/50 shadow-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span className="flex items-center gap-2">
                Sign In
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={handleSubmitCase}
              className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span className="flex items-center gap-2">
                Submit a Case
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </button>
          </div>

          {/* Animated stats section */}
          <div 
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease-out 1s'
            }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">4</div>
              <div className="text-white/70 text-sm">Case Types</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">24/7</div>
              <div className="text-white/70 text-sm">Access</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">100%</div>
              <div className="text-white/70 text-sm">Transparent</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.8s ease-out 1.2s'
          }}
        >
          <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* What This System Handles - Enhanced */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a365d]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2d5a27]/5 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              What This System Handles
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto leading-relaxed">
              The Digital Legal Affairs Management System supports the full spectrum of legal matters across the university
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Disciplinary */}
            <div 
              className="bg-gradient-to-br from-[#faf8f5] to-white rounded-2xl p-10 border border-[#1a365d]/10 hover:border-[#1a365d]/30 hover:shadow-2xl transition-all duration-500 group cursor-pointer"
              onMouseEnter={() => setActiveCard('disciplinary')}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                transform: activeCard === 'disciplinary' ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'transform 0.3s ease-out'
              }}
              tabIndex={0}
              role="button"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCard('disciplinary');
                }
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#1a365d] to-[#2d4a6d] rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1a365d] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Disciplinary Matters
              </h3>
              <p className="text-[#475569] leading-relaxed mb-6">
                Student and staff disciplinary cases, from initial reports through hearings and final resolutions, with full documentation and timeline tracking
              </p>
              <div className="flex items-center text-[#1a365d] font-medium group-hover:translate-x-2 transition-transform">
                <span>Learn more</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Property */}
            <div 
              className="bg-gradient-to-br from-[#faf8f5] to-white rounded-2xl p-10 border border-[#2d5a27]/10 hover:border-[#2d5a27]/30 hover:shadow-2xl transition-all duration-500 group cursor-pointer"
              onMouseEnter={() => setActiveCard('property')}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                transform: activeCard === 'property' ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'transform 0.3s ease-out'
              }}
              tabIndex={0}
              role="button"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCard('property');
                }
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#2d5a27] to-[#3d7a37] rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#2d5a27] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Property & Infrastructure
              </h3>
              <p className="text-[#475569] leading-relaxed mb-6">
                University property disputes, infrastructure-related legal matters, and facility use cases with proper documentation and stakeholder coordination
              </p>
              <div className="flex items-center text-[#2d5a27] font-medium group-hover:translate-x-2 transition-transform">
                <span>Learn more</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Scholarship */}
            <div 
              className="bg-gradient-to-br from-[#faf8f5] to-white rounded-2xl p-10 border border-[#c9a227]/10 hover:border-[#c9a227]/30 hover:shadow-2xl transition-all duration-500 group cursor-pointer"
              onMouseEnter={() => setActiveCard('scholarship')}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                transform: activeCard === 'scholarship' ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'transform 0.3s ease-out'
              }}
              tabIndex={0}
              role="button"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCard('scholarship');
                }
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#c9a227] to-[#d9b337] rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#c9a227] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Scholarship & Sponsorship
              </h3>
              <p className="text-[#475569] leading-relaxed mb-6">
                Scholarship agreement management, sponsor coordination, and student support documentation with agreement tracking and compliance monitoring
              </p>
              <div className="flex items-center text-[#c9a227] font-medium group-hover:translate-x-2 transition-transform">
                <span>Learn more</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            {/* Personal */}
            <div 
              className="bg-gradient-to-br from-[#faf8f5] to-white rounded-2xl p-10 border border-[#475569]/10 hover:border-[#475569]/30 hover:shadow-2xl transition-all duration-500 group cursor-pointer"
              onMouseEnter={() => setActiveCard('personal')}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                transform: activeCard === 'personal' ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'transform 0.3s ease-out'
              }}
              tabIndex={0}
              role="button"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveCard('personal');
                }
              }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#475569] to-[#577579] rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#475569] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Personal Matters
              </h3>
              <p className="text-[#475569] leading-relaxed mb-6">
                Individual legal concerns, personal grievances, and confidential matters handled with appropriate privacy and procedural safeguards
              </p>
              <div className="flex items-center text-[#475569] font-medium group-hover:translate-x-2 transition-transform">
                <span>Learn more</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced Animated Lifecycle */}
      <section 
        ref={lifecycleRef}
        className="py-32 px-6 bg-gradient-to-br from-[#1a365d] to-[#2d5a27] relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: Math.random() * 200 + 50,
                height: Math.random() * 200 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
        `}</style>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              How It Works
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
              A clear process from submission to resolution
            </p>
          </div>

          <div className="relative">
            {/* Animated connecting line */}
            <div 
              className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-[#c9a227] via-[#2d5a27] to-[#c9a227] transform -translate-y-1/2 hidden md:block rounded-full"
              style={{
                opacity: lifecycleVisible ? 1 : 0,
                transition: 'opacity 1s ease-out 0.5s',
                backgroundSize: '200% 100%',
                animation: lifecycleVisible ? 'gradientMove 3s linear infinite' : 'none'
              }}
            ></div>

            <style jsx>{`
              @keyframes gradientMove {
                0% { background-position: 0% 50%; }
                100% { background-position: 100% 50%; }
              }
            `}</style>

            <div className="grid md:grid-cols-3 gap-16 relative">
              {/* Step 1 */}
              <div 
                className="text-center relative group"
                style={{
                  opacity: lifecycleVisible ? 1 : 0,
                  transform: lifecycleVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out 0.3s'
                }}
              >
                <div className="w-28 h-28 bg-gradient-to-br from-[#c9a227] to-[#b8911f] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl font-bold text-white">1</span>
                  <div className="absolute inset-0 rounded-full bg-[#c9a227] animate-ping opacity-20"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Submit
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Report your case through the online portal with all relevant details and documentation
                </p>
              </div>

              {/* Step 2 */}
              <div 
                className="text-center relative group"
                style={{
                  opacity: lifecycleVisible ? 1 : 0,
                  transform: lifecycleVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out 0.6s'
                }}
              >
                <div className="w-28 h-28 bg-gradient-to-br from-[#2d5a27] to-[#3d7a37] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl font-bold text-white">2</span>
                  <div className="absolute inset-0 rounded-full bg-[#2d5a27] animate-ping opacity-20"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Review & Assign
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Legal Affairs reviews the case and assigns it to the appropriate officer for handling
                </p>
              </div>

              {/* Step 3 */}
              <div 
                className="text-center relative group"
                style={{
                  opacity: lifecycleVisible ? 1 : 0,
                  transform: lifecycleVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.6s ease-out 0.9s'
                }}
              >
                <div className="w-28 h-28 bg-gradient-to-br from-[#c9a227] to-[#b8911f] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-5xl font-bold text-white">3</span>
                  <div className="absolute inset-0 rounded-full bg-[#c9a227] animate-ping opacity-20"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Resolution
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Your assigned officer manages the case through hearings, deadlines, and final resolution
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Every Role - Enhanced */}
      <section className="py-32 px-6 bg-[#faf8f5] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#1a365d]/5 to-[#2d5a27]/5 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Built for Every Role
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto leading-relaxed">
              Tailored experiences for everyone in the legal process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Reporters */}
            <div className="bg-white rounded-2xl p-8 border border-[#1a365d]/10 hover:shadow-2xl hover:border-[#1a365d]/30 transition-all duration-500 group cursor-pointer hover:-translate-y-2" tabIndex={0} role="button">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1a365d] to-[#2d4a6d] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1a365d] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Reporters
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Submit cases and track their progress through a simple, welcoming interface designed for occasional users
              </p>
            </div>

            {/* Legal Officers */}
            <div className="bg-white rounded-2xl p-8 border border-[#2d5a27]/10 hover:shadow-2xl hover:border-[#2d5a27]/30 transition-all duration-500 group cursor-pointer hover:-translate-y-2" tabIndex={0} role="button">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2d5a27] to-[#3d7a37] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2d5a27] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Legal Officers
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Manage assigned cases with a focused dashboard showing urgent items, hearings, deadlines, and case history
              </p>
            </div>

            {/* Heads */}
            <div className="bg-white rounded-2xl p-8 border border-[#c9a227]/10 hover:shadow-2xl hover:border-[#c9a227]/30 transition-all duration-500 group cursor-pointer hover:-translate-y-2" tabIndex={0} role="button">
              <div className="w-16 h-16 bg-gradient-to-br from-[#c9a227] to-[#d9b337] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#c9a227] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Department Heads
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Oversee case assignments, review departmental statistics, and ensure cases are properly distributed
              </p>
            </div>

            {/* Admins */}
            <div className="bg-white rounded-2xl p-8 border border-[#475569]/10 hover:shadow-2xl hover:border-[#475569]/30 transition-all duration-500 group cursor-pointer hover:-translate-y-2" tabIndex={0} role="button">
              <div className="w-16 h-16 bg-gradient-to-br from-[#475569] to-[#577579] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#475569] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Administrators
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                Configure the system, manage users and permissions, and oversee all legal operations across campuses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Footer Section - Enhanced */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#1a365d] to-[#2d5a27] relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: Math.random() * 150 + 50,
                height: Math.random() * 150 + 50,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 8 + 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#c9a227] to-[#b8911f] rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-5xl" style={{ fontFamily: 'Playfair Display, serif' }}>G</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                    University of Gondar
                  </h3>
                  <p className="text-white/70 text-lg">Legal Affairs Office</p>
                </div>
              </div>
              <p className="text-white/80 mb-8 leading-relaxed text-lg">
                The Digital Legal Affairs Management System is the official platform for managing all legal matters across University of Gondar campuses, ensuring transparency, efficiency, and proper documentation.
              </p>
              <div className="text-white/60 text-sm space-y-3">
                <p className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  legal.affairs@uog.edu.et
                </p>
                <p className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  University of Gondar, Ethiopia
                </p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-white/70 mb-6 text-lg">Ready to get started?</p>
              <button
                onClick={handleSignIn}
                className="group px-12 py-6 bg-gradient-to-r from-[#c9a227] to-[#b8911f] text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#c9a227]/50 shadow-lg text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span className="flex items-center gap-3">
                  Sign In to Your Account
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

