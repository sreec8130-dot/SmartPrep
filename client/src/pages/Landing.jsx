import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import {
  IconSparkles,
  IconCalendar,
  IconBook,
  IconClock,
  IconChart,
  IconPlay,
  IconCheck,
  IconMenu,
  IconClose,
} from '../components/Icons';

export default function Landing() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const loggedIn = isAuthenticated();

  const scrollToSection = (id) => {
    setMobileNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: IconSparkles,
      title: 'AI-Powered Study Planning',
      description:
        'Intelligent timetable generation that calculates remaining syllabus time, weights nearest exam proximity, and optimizes topic difficulty.',
    },
    {
      icon: IconCalendar,
      title: 'Personalized Schedules',
      description:
        'Strictly schedules study sessions within your custom daily hours with automatic break buffers and intelligent session splitting.',
    },
    {
      icon: IconBook,
      title: 'Subject & Topic Management',
      description:
        'Pre-installed academic subject library with customizable topics, difficulty rankings, estimated minutes, and priority ratings.',
    },
    {
      icon: IconClock,
      title: 'Exam Tracking',
      description:
        'Always stay prepared with live countdowns to midterm and semester examinations, automatically prioritizing urgent subjects.',
    },
    {
      icon: IconPlay,
      title: 'Study Session Timing',
      description:
        'Interactive focus timer to track real-time study minutes, log completed topics, and maintain daily academic momentum.',
    },
    {
      icon: IconChart,
      title: 'Progress Tracking',
      description:
        'Visual academic analytics, subject-wise completion rates, milestone celebrations, and comprehensive syllabus coverage tracking.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Add Your Subjects',
      description:
        'Pick from our curated library of academic subjects or quickly create custom subjects with tailored topics.',
    },
    {
      number: '02',
      title: 'Set Your Exams & Goals',
      description:
        'Enter upcoming exam dates and define your preferred study window, session duration, and break lengths.',
    },
    {
      number: '03',
      title: 'Generate Your Study Plan',
      description:
        'Our AI scheduling engine generates an exact daily timetable with specific start and end times for every session.',
    },
    {
      number: '04',
      title: 'Track Your Progress',
      description:
        'Follow your timetable, mark topics completed, log focus sessions, and head into your exams with total confidence.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-teal-100 selection:text-teal-900 relative">
      {/* ──────────────── Navbar ──────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Name */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="SmartPrep Logo"
                className="w-10 h-10 rounded-xl object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1"
              />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                  SmartPrep
                </span>
                <span className="text-[10px] font-semibold text-teal-600 tracking-wider uppercase">
                  Study Planner
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors cursor-pointer"
              >
                About
              </button>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              {loggedIn && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  Go to Dashboard →
                </Link>
              )}
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-teal-600 rounded-xl transition-all duration-200 hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs shadow-teal-200 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none transition-transform duration-200 active:scale-95"
                aria-label="Toggle Navigation"
              >
                {mobileNavOpen ? <IconClose className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileNavOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fade-in">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-teal-600"
            >
              About
            </button>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {loggedIn && (
                <Link
                  to="/dashboard"
                  className="w-full text-center py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl"
                >
                  Go to Dashboard →
                </Link>
              )}
              <Link
                to="/login"
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ──────────────── Hero Section with Subtle Background Animations ──────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle Background Dot Grid */}
        <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none -z-10" />

        {/* Animated Background Glowing Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-float-drift" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10 animate-float-reverse" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-teal-200/40 via-teal-100/25 to-transparent blur-3xl pointer-events-none -z-10 rounded-full animate-pulse-glow" />

        {/* Subtle Floating Study Accents / Sparkles */}
        <div className="absolute top-20 left-10 text-teal-400/35 pointer-events-none -z-10 animate-twinkle hidden sm:block">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5z" />
          </svg>
        </div>
        <div className="absolute top-36 right-20 text-teal-400/30 pointer-events-none -z-10 animate-twinkle hidden sm:block" style={{ animationDelay: '2s' }}>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5z" />
          </svg>
        </div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 rounded-full border border-teal-300/40 pointer-events-none -z-10 animate-float-gentle hidden sm:block" />
        <div className="absolute bottom-24 right-1/4 w-2.5 h-2.5 rounded-full bg-teal-200/50 pointer-events-none -z-10 animate-float-drift hidden sm:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-700 text-xs font-semibold tracking-wide shadow-2xs hover:bg-teal-100/70 transition-colors">
                <IconSparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span>AI-Powered Personalized Study Planner</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Study Smarter.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-teal-700">
                  Prepare Better.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                SmartPrep is an AI-powered personalized study planner that helps you organize your subjects,
                create effective study schedules, prepare for exams, and track your progress.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-200 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 text-center"
                >
                  Login to Account
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <IconCheck className="w-4 h-4 text-teal-600" />
                  Predefined CS Subject Library
                </span>
                <span className="flex items-center gap-1.5">
                  <IconCheck className="w-4 h-4 text-teal-600" />
                  Realistic Daily Timetables
                </span>
                <span className="flex items-center gap-1.5">
                  <IconCheck className="w-4 h-4 text-teal-600" />
                  100% Free for Students
                </span>
              </div>
            </div>

            {/* Right Column: Floating Timetable Preview Card */}
            <div className="lg:col-span-5 relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Outer decorative card with gentle float animation */}
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/80 border border-slate-200/90 transition-all duration-300 hover:shadow-2xl animate-float">
                {/* Header of Timetable Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">Daily AI Schedule</h4>
                      <p className="text-[11px] text-teal-600 font-medium">Monday — Active Timetable</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    On Track
                  </span>
                </div>

                {/* Timetable Session Slots */}
                <div className="mt-5 space-y-3">
                  {/* Slot 1: Completed Session */}
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/60 flex items-center justify-between transition-transform duration-200 hover:scale-[1.02]">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs shadow-xs">
                        <IconCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Data Structures</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-800">Trees (Part 1)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">09:00 AM – 10:00 AM</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md">60m</span>
                  </div>

                  {/* Slot 2: Break Buffer */}
                  <div className="px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200/50 flex items-center justify-between transition-transform duration-200 hover:scale-[1.02]">
                    <div className="flex items-center space-x-2 text-amber-800">
                      <IconClock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Rest & Refreshment Break</span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-700">10:00 AM – 10:15 AM</span>
                  </div>

                  {/* Slot 3: Upcoming Session */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between transition-transform duration-200 hover:scale-[1.02]">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                        <IconClock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">DBMS</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-800">Normalization</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">10:15 AM – 11:15 AM</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">60m</span>
                  </div>
                </div>

                {/* Floating Achievement Badges */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-teal-700 font-medium">
                    <IconSparkles className="w-4 h-4 text-teal-600" />
                    <span>Algorithmic Schedule</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">3 of 3 Topics Covered</span>
                </div>
              </div>

              {/* Floating Accent Pill with subtle float animation */}
              <div className="hidden sm:flex absolute -bottom-5 -left-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl p-3 shadow-lg items-center space-x-3 animate-float-gentle">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-xs">
                  <IconCalendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Nearest Exam in 10 Days</p>
                  <p className="text-[11px] text-teal-600 font-medium">Data Structures Final</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── Features Section with subtle ambient backdrop ──────────────── */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">
              Comprehensive Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Ace Your Exams
            </h3>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              Built specifically for university and competitive exam students, SmartPrep transforms chaotic study
              lists into structured daily execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/70 hover:bg-white rounded-2xl p-7 border border-slate-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center mb-5 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── How It Works Section ──────────────── */}
      <section id="how-it-works" className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">
              Simple 4-Step Process
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How SmartPrep Works
            </h3>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              Take the guesswork out of test preparation with our automated scheduling workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-black text-teal-600/30 mb-3 font-mono">
                    {step.number}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── About SmartPrep Section ──────────────── */}
      <section id="about" className="py-20 bg-white border-t border-slate-200/80 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 mb-2 hover:scale-110 transition-transform">
            <IconBook className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About SmartPrep
          </h2>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto font-normal">
            SmartPrep is designed to help students turn their academic goals into structured, manageable study plans.
            Instead of manually deciding what to study and when, SmartPrep organizes your workload around your subjects,
            topics, exams, priorities, and available study time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <h5 className="font-bold text-slate-900 text-sm mb-1">Algorithmic Optimization</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prioritizes topics by imminent exam dates and difficulty level rather than arbitrary alphabetical ordering.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <h5 className="font-bold text-slate-900 text-sm mb-1">Human-Friendly Pacing</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically splits oversized topics into digestible sessions with built-in rest breaks.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <h5 className="font-bold text-slate-900 text-sm mb-1">Zero Overhead</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pre-populated CS curricula enable complete setup in under 2 minutes without tedious typing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── Call-To-Action (CTA) Section with Ambient Floating Motion ──────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white relative overflow-hidden">
        {/* Subtle Ambient Background Motion Orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-float-drift" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-700/50 border border-teal-500/30 text-teal-200 text-xs font-semibold">
            <IconSparkles className="w-3.5 h-3.5" />
            <span>Start Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to Study Smarter?
          </h2>

          <p className="text-base sm:text-lg text-teal-100 max-w-xl mx-auto leading-relaxed">
            Create your personalized study plan and take control of your preparation.
          </p>

          <div className="pt-2">
            <Link
              to="/register"
              className="inline-block px-9 py-4 text-base font-semibold text-teal-950 bg-white hover:bg-teal-50 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── Footer ──────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="SmartPrep Logo" className="w-9 h-9 rounded-xl object-contain" />
              <div>
                <span className="font-bold text-lg text-white block leading-tight">SmartPrep</span>
                <span className="text-[11px] text-teal-400 font-medium">AI-Powered Personalized Study Planner</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                About
              </button>
              <Link to="/login" className="hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} SmartPrep. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
