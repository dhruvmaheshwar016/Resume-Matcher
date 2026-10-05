import React, { useState, useEffect } from 'react';
import { Upload, FileText, Zap, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/UserMenu';
import ResumeUpload from '../components/ResumeUpload';
import JobDescriptionInput from '../components/JobDescriptionInput';
import AnalysisResults from '../components/AnalysisResults';
import { API_BASE } from '@/lib/api';

const Index = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Don't render anything while loading or if not authenticated
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isReady = !!resumeFile && !!jobDescription.trim();

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setErrorMessage('Please upload a resume and enter a job description.');
      return;
    }
    if (!session?.token) {
      setErrorMessage('You are not logged in. Please sign in again.');
      navigate('/auth');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('resume_file', resumeFile);
      formData.append('job_description', jobDescription);

      const res = await fetch(`${API_BASE}/analyze/pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || `Server error: ${res.status}`);
      }

      // Map backend response to the shape AnalysisResults component expects
      setAnalysisResults({
        overallScore: data.scores.overall_score,
        skillsScore: data.scores.skills_score,
        keywordScore: data.scores.keyword_score,
        experienceScore: data.scores.experience_score,
        formattingScore: data.scores.formatting_score,
        matchedSkills: data.matched_skills,
        missingSkills: data.missing_skills,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        recommendations: data.recommendations,
        summary: data.summary,
        atsTips: data.ats_tips,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Resume Matcher
              </h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Perfect Your Resume for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Every Job</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Our AI-powered system analyzes how well your resume matches job descriptions,
            giving you insights on skills, keywords, and experience alignment.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="bg-blue-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">Advanced algorithms analyze your resume against job requirements</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Match Scoring</h3>
              <p className="text-gray-600">Get detailed scores for skills, keywords, and experience alignment</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="bg-green-100 p-3 rounded-lg w-fit mx-auto mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Improvement Tips</h3>
              <p className="text-gray-600">Receive actionable recommendations to enhance your resume</p>
            </div>
          </div>
        </div>

        {/* Main Application */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-xl">
          {!analysisResults ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Resume Upload */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Upload className="h-6 w-6 mr-3 text-blue-600" />
                  Upload Your Resume
                </h3>
                <ResumeUpload
                  onResumeExtracted={setResumeText}
                  onFileSelected={setResumeFile}
                />
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-purple-600" />
                  Job Description
                </h3>
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                />
              </div>
            </div>
          ) : (
            <AnalysisResults
              results={analysisResults}
              onReset={() => {
                setAnalysisResults(null);
                setResumeText('');
                setResumeFile(null);
                setJobDescription('');
                setErrorMessage('');
              }}
            />
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Action Button */}
          {!analysisResults && (
            <div className="text-center mt-8">
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !isReady}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isAnalyzing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing with AI...
                  </div>
                ) : (
                  'Analyze Match'
                )}
              </button>
              {!isReady && !isAnalyzing && (
                <p className="text-sm text-gray-400 mt-3">
                  Upload a PDF resume and add a job description to get started
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
