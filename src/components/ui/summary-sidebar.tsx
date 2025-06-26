'use client';

import React, { useEffect } from 'react';
import { X, User, Home, Sparkles, MapPin, DollarSign, Users } from 'lucide-react';
import { useSummary } from '@/contexts/SummaryContext';
import { Profile, Apartment } from '@/lib/schema';

const generateSummary = async (type: 'profile' | 'apartment', data: Profile | Apartment): Promise<string> => {
  try {
    const response = await fetch('/api/ai-calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    return result.summary;
  } catch (error) {
    console.error('Error calling AI summary API:', error);
    throw error;
  }
};





export function SummarySidebar() {
  const { isOpen, summaryData, closeSummary, setSummary, setLoading } = useSummary();

  useEffect(() => {
    if (isOpen && summaryData && !summaryData.summary && summaryData.isLoading) {
      generateSummary(summaryData.type, summaryData.data)
        .then(summary => {
          setSummary(summary);
        })
        .catch(error => {
          console.error('Error generating summary:', error);
          const errorMessage = error.message?.includes('API key') 
            ? 'AI service is not configured. Please check the API key.'
            : 'Sorry, I encountered an error while generating the summary. Please try again.';
          setSummary(errorMessage);
          setLoading(false);
        });
    }
  }, [isOpen, summaryData, setSummary, setLoading]);

  if (!isOpen || !summaryData) return null;

  const isProfile = summaryData.type === 'profile';
  const data = summaryData.data;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSummary}
      />
      
      {/* Popup Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Summary</h2>
                <p className="text-sm text-indigo-100">
                  {isProfile ? 'Profile Analysis' : 'Property Analysis'}
                </p>
              </div>
            </div>
            <button
              onClick={closeSummary}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[70vh]">
            {/* Quick Info Card */}
            <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                {isProfile ? (
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Home className="h-5 w-5 text-indigo-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {isProfile ? (data as Profile).name : (data as Apartment).location}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isProfile ? `@${(data as Profile).username}` : `$${(data as Apartment).rent.toLocaleString()}/mo`}
                  </p>
                </div>
              </div>
              
              {isProfile ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Rep: {(data as Profile).reputationScore}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Interests: {(data as Profile).apartments_interested?.size || 0}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span>${(data as Apartment).stake.toLocaleString()} stake</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-blue-600" />
                    <span>{(data as Apartment).interested} interested</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h4 className="font-semibold text-gray-900">AI Analysis</h4>
              </div>
              
              {summaryData.isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
                    <div>
                      <span className="text-indigo-700 font-medium">Analyzing with Google Gemini AI...</span>
                      <p className="text-sm text-indigo-600 mt-1">Generating comprehensive insights</p>
                    </div>
                  </div>
                  {/* Enhanced Loading skeleton */}
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-4/5"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-3/5"></div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                      {summaryData.summary}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!summaryData.isLoading && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setLoading(true);
                      generateSummary(summaryData.type, summaryData.data)
                        .then(setSummary)
                        .catch((error) => {
                          const errorMessage = error.message?.includes('API key') 
                            ? 'AI service is not configured. Please check the API key.'
                            : 'Error regenerating summary. Please try again.';
                          setSummary(errorMessage);
                          setLoading(false);
                        });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4 inline mr-2" />
                    Regenerate
                  </button>
                  <button
                    onClick={closeSummary}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
                     </div>
         </div>
       </div>
     </div>
     </>
   );
 } 