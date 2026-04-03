import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [currentResume, setCurrentResume] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { api } = useAuth();

  const uploadResume = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await api.post('/resumes', formData);
      const data = response.data;
      setCurrentResume(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading resume');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeResume = async (resumeId, jobDescription, githubUsername) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/resumes/${resumeId}/analyze`, {
        jobDescription,
        githubUsername
      });
      return response.data; // Returns { jobId, status }
    } catch (err) {
      setError(err.response?.data?.error || 'Error initiating analysis');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalysisStatus = async (jobId) => {
    try {
      const response = await api.get(`/analysis/status/${jobId}`);
      return response.data || { status: 'failed', error: 'Empty status response' };
    } catch (err) {
      console.error("Status check failed:", err);
      return { status: 'failed', error: err.response?.data?.error || err.message || 'Analysis status unavailable' };
    }
  };

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/resumes');
      const data = response.data;
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getResumeById = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/resumes/${id}`);
      const data = response.data;
      setCurrentResume(data);
      if (data.analysis) {
        setAnalysisResults(data.analysis);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching resume details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const compareResumes = async (idA, idB) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/resumes/compare', { idA, idB });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error comparing resumes');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResumeContext.Provider value={{
      currentResume,
      analysisResults,
      history,
      isLoading,
      error,
      uploadResume,
      analyzeResume,
      fetchHistory,
      getResumeById,
      compareResumes,
      fetchAnalysisStatus,
      setAnalysisResults,
      setCurrentResume
    }}>
      {children}
    </ResumeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useResumes = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumes must be used within a ResumeProvider');
  }
  return context;
};
