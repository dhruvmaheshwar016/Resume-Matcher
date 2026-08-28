
import React from 'react';
import { TrendingUp, Award, Target, Lightbulb, RotateCcw, CheckCircle, XCircle, Star, AlertTriangle, Cpu } from 'lucide-react';

interface AnalysisResultsProps {
  results: {
    overallScore: number;
    skillsScore: number;
    keywordScore: number;
    experienceScore: number;
    formattingScore?: number;
    matchedSkills: string[];
    missingSkills?: string[];
    strengths?: string[];
    weaknesses?: string[];
    recommendations: string[];
    summary?: string;
    atsTips?: string[];
  };
  onReset: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results, onReset }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const scoreCards = [
    { label: 'Skills Match', value: results.skillsScore, icon: Award },
    { label: 'Keywords', value: results.keywordScore, icon: Target },
    { label: 'Experience', value: results.experienceScore, icon: TrendingUp },
    ...(results.formattingScore !== undefined
      ? [{ label: 'Formatting', value: results.formattingScore, icon: Cpu }]
      : []),
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Analysis Results</h2>
        <button
          onClick={onReset}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Analyze Another
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Overall Match Score</h3>
            {results.summary ? (
              <p className="text-blue-100 leading-relaxed">{results.summary}</p>
            ) : (
              <p className="text-blue-100">
                {results.overallScore >= 80
                  ? 'Excellent match! Your resume aligns well with this job.'
                  : results.overallScore >= 60
                  ? 'Good match with room for improvement.'
                  : 'Consider updating your resume to better match this role.'}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold mb-1">{results.overallScore}</div>
            <div className="text-blue-200 text-sm">out of 100</div>
          </div>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className={`grid gap-6 ${scoreCards.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        {scoreCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getScoreBg(value)}`}>
                  <Icon className={`h-5 w-5 ${getScoreColor(value)}`} />
                </div>
                <span className="ml-3 font-semibold text-gray-900">{label}</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Matched & Missing Skills */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Matched Skills
          </h3>
          {results.matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {results.matchedSkills.map((skill, i) => (
                <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No matching skills found.</p>
          )}
        </div>

        {/* Missing Skills */}
        {results.missingSkills && results.missingSkills.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-500" />
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {results.missingSkills.map((skill, i) => (
                <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      {(results.strengths?.length || results.weaknesses?.length) && (
        <div className="grid md:grid-cols-2 gap-6">
          {results.strengths && results.strengths.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-blue-500" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {results.strengths.map((s, i) => (
                  <li key={i} className="flex items-start text-gray-700 text-sm">
                    <span className="text-blue-500 mr-2 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.weaknesses && results.weaknesses.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {results.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start text-gray-700 text-sm">
                    <span className="text-orange-500 mr-2 mt-0.5">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
          Recommendations for Improvement
        </h3>
        <ul className="space-y-3">
          {results.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start">
              <div className="bg-yellow-100 p-1 rounded-full mr-3 mt-0.5">
                <div className="w-2 h-2 bg-yellow-600 rounded-full" />
              </div>
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ATS Tips */}
      {results.atsTips && results.atsTips.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
            <Cpu className="h-5 w-5 mr-2 text-indigo-600" />
            ATS Optimization Tips
          </h3>
          <ul className="space-y-2">
            {results.atsTips.map((tip, i) => (
              <li key={i} className="flex items-start text-indigo-800 text-sm">
                <span className="text-indigo-500 mr-2 mt-0.5 font-bold">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
