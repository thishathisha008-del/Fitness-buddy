/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MedicalDisclaimerBanner } from './components/MedicalDisclaimerBanner';
import { Navbar, ActiveTab } from './components/Navbar';
import { AssessmentModal } from './components/AssessmentModal';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { ActiveWorkoutPlayer } from './components/ActiveWorkoutPlayer';
import { NutritionView } from './components/NutritionView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AiCoachChat } from './components/AiCoachChat';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { AdminDashboard } from './components/AdminDashboard';
import { FuturesView } from './components/FuturesView';

import {
  UserProfile,
  WorkoutPlan,
  WorkoutDay,
  WorkoutSessionLog,
  ProgressEntry,
  ChatMessage,
  LibraryExercise,
} from './types/fitness';

import {
  getStoredProfile,
  saveStoredProfile,
  getStoredActivePlan,
  saveStoredActivePlan,
  getStoredWorkoutLogs,
  saveStoredWorkoutLogs,
  getStoredProgressEntries,
  saveStoredProgressEntries,
  getStoredChatMessages,
  saveStoredChatMessages,
  getAllExercises,
  calculateStreak,
  clearAllStorage,
} from './utils/storage';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [activePlan, setActivePlan] = useState<WorkoutPlan>(getStoredActivePlan);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSessionLog[]>(getStoredWorkoutLogs);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>(getStoredProgressEntries);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(getStoredChatMessages);
  const [exercises, setExercises] = useState<LibraryExercise[]>(getAllExercises);

  const [activeTab, setActiveTab] = useState<ActiveTab>('plan');
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<WorkoutDay | null>(null);

  const workoutStreak = calculateStreak(workoutLogs);

  // Sync state changes with persistence
  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveStoredActivePlan(activePlan);
  }, [activePlan]);

  useEffect(() => {
    saveStoredWorkoutLogs(workoutLogs);
  }, [workoutLogs]);

  useEffect(() => {
    saveStoredProgressEntries(progressEntries);
  }, [progressEntries]);

  useEffect(() => {
    saveStoredChatMessages(chatMessages);
  }, [chatMessages]);

  const handleStartSession = (day: WorkoutDay) => {
    setActiveWorkoutDay(day);
    setActiveTab('session');
  };

  const handleFinishWorkout = (log: WorkoutSessionLog) => {
    const updated = [log, ...workoutLogs];
    setWorkoutLogs(updated);
    setActiveWorkoutDay(null);
    setActiveTab('progress');
  };

  const handlePlanGenerated = (newPlan: WorkoutPlan) => {
    setActivePlan(newPlan);
    setActiveTab('plan');
  };

  const handlePlanUpdated = (updatedPlan: WorkoutPlan) => {
    setActivePlan(updatedPlan);
  };

  const handleAddProgressEntry = (entry: ProgressEntry) => {
    setProgressEntries([...progressEntries, entry]);
    setProfile((prev) => ({ ...prev, weightKg: entry.weightKg }));
  };

  const handleSendMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const handleReceiveReply = (reply: ChatMessage) => {
    setChatMessages((prev) => [...prev, reply]);
  };

  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hi ${profile.name}! I'm your AI fitness coach. How can I help you optimize your ${profile.goal.replace('_', ' ')} routine or answer any questions today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleRefreshExercises = () => {
    setExercises(getAllExercises());
  };

  const handleResetAllData = () => {
    if (window.confirm('Are you sure you want to reset all FitBuddy data to default values?')) {
      clearAllStorage();
      window.location.reload();
    }
  };

  const handleImportData = (data: any) => {
    if (data.profile) setProfile(data.profile);
    if (data.activePlan) setActivePlan(data.activePlan);
    if (data.workoutLogs) setWorkoutLogs(data.workoutLogs);
    if (data.progressEntries) setProgressEntries(data.progressEntries);
    alert('FitBuddy backup restored successfully!');
    handleRefreshExercises();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Medical & Safety Disclaimer Notice */}
      <MedicalDisclaimerBanner />

      {/* Main App Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenAssessment={() => setIsAssessmentOpen(true)}
        workoutStreak={workoutStreak}
        hasActiveSession={!!activeWorkoutDay}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Workout Plan View */}
        {activeTab === 'plan' && (
          <WorkoutPlanView
            plan={activePlan}
            profile={profile}
            onPlanUpdated={handlePlanUpdated}
            onStartSession={handleStartSession}
            onOpenAssessment={() => setIsAssessmentOpen(true)}
          />
        )}

        {/* Live Active Session Tracker */}
        {activeTab === 'session' && (
          <div>
            {activeWorkoutDay ? (
              <ActiveWorkoutPlayer
                day={activeWorkoutDay}
                planTitle={activePlan.planTitle}
                profile={profile}
                onFinishWorkout={handleFinishWorkout}
                onCancel={() => {
                  setActiveWorkoutDay(null);
                  setActiveTab('plan');
                }}
              />
            ) : (
              <div className="max-w-md mx-auto text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <span className="text-xl">🏃</span>
                </div>
                <h3 className="text-lg font-bold text-white">No Workout Session Currently Active</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Head over to your Workout Plan tab and select any training day to begin real-time set and rep tracking with the rest timer.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const firstActiveDay = activePlan.schedule.find((d) => !d.isRestDay) || activePlan.schedule[0];
                    handleStartSession(firstActiveDay);
                  }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Start Day 1 Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Nutrition & Meals */}
        {activeTab === 'nutrition' && (
          <NutritionView
            nutritionPlan={activePlan.nutritionPlan}
            profile={profile}
          />
        )}

        {/* Progress & Logs */}
        {activeTab === 'progress' && (
          <ProgressDashboard
            progressEntries={progressEntries}
            workoutLogs={workoutLogs}
            profile={profile}
            onAddProgressEntry={handleAddProgressEntry}
          />
        )}

        {/* AI Futures & Body Projections */}
        {activeTab === 'futures' && (
          <FuturesView
            profile={profile}
            activePlan={activePlan}
          />
        )}

        {/* AI Fitness Coach Chatbot */}
        {activeTab === 'coach' && (
          <AiCoachChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onReceiveReply={handleReceiveReply}
            onClearHistory={handleClearChat}
            profile={profile}
            activePlan={activePlan}
          />
        )}

        {/* Exercise Encyclopedia & Smart Substitutions */}
        {activeTab === 'library' && (
          <ExerciseLibraryView exercises={exercises} />
        )}

        {/* Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            profile={profile}
            activePlan={activePlan}
            exercises={exercises}
            workoutLogs={workoutLogs}
            progressEntries={progressEntries}
            onRefreshExercises={handleRefreshExercises}
            onResetAllData={handleResetAllData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Fitness Assessment & Generation Modal */}
      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        onPlanGenerated={handlePlanGenerated}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">FitBuddy AI</span>
            <span>·</span>
            <span>Gemini-Powered Hyper-Personalized Training & Nutrition</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Structured Outputs</span>
            <span>·</span>
            <span>Smart Biomechanics</span>
            <span>·</span>
            <button
              onClick={() => setIsAssessmentOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Re-Assess
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
