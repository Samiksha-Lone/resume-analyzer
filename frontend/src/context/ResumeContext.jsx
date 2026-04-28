import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [currentResume, setCurrentResume] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);
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
      const data = response.data?.data || response.data;
      setCurrentResume(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error uploading resume');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/history/${id}`);
      setAnalysisHistory(prev => prev.filter(item => item._id !== id));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error deleting history item';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeResume = async (resumeId, jobDescription, jobTitle = '', targetSkills = []) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/resumes/${resumeId}/analyze`, {
        jobDescription,
        jobTitle,
        targetSkills
      });
      return response.data?.data || response.data; // Returns { jobId, status }
    } catch (err) {
      setError(err.response?.data?.error || 'Error initiating analysis');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const matchResume = async (resumeId, jobDescription, jobTitle = '', targetSkills = []) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/resumes/${resumeId}/match`, {
        jobDescription,
        jobTitle,
        targetSkills
      });
      const result = response.data?.data?.match || response.data?.match || response.data?.data;
      return result;
    } catch (err) {
      setError(err.response?.data?.error || 'Error matching resume');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalysisStatus = async (jobId) => {
    try {
      const response = await api.get(`/analysis/status/${jobId}`);
      return response.data?.data || response.data || { status: 'failed', error: 'Empty status response' };
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
      const data = response.data?.data?.resumes || response.data?.resumes || response.data || [];
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching history');
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const fetchAnalysisHistory = useCallback(async () => {
    try {
      const response = await api.get('/history');
      const entries = response.data?.data?.history || response.data?.history || [];
      setAnalysisHistory(Array.isArray(entries) ? entries : []);
      return entries;
    } catch (err) {
      console.error('Failed to fetch analysis history:', err);
      return [];
    }
  }, [api]);

  const compareAnalysisHistory = async (v1, v2) => {
    try {
      const response = await api.get('/history/compare', { params: { v1, v2 } });
      return response.data?.data || response.data;
    } catch (err) {
      console.error('Failed to compare history:', err);
      throw err;
    }
  };

  const getResumeById = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/resumes/${id}`);
      const data = response.data?.data?.resume || response.data?.resume || response.data;
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


  const getHistoryById = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/history/${id}`);
      // The backend returns { success: true, data: { history: entry } }
      const entry = response.data?.data?.history || response.data?.history;
      
      if (entry && entry.snapshot) {
        setAnalysisResults(entry.snapshot);
        return entry;
      } else {
        throw new Error("Analysis snapshot not found in history entry");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Error fetching historical analysis';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResumeContext.Provider value={{
      currentResume,
      analysisResults,
      history,
      analysisHistory,
      isLoading,
      error,
      uploadResume,
      analyzeResume,
      fetchHistory,
      fetchAnalysisHistory,
      compareAnalysisHistory,
      getResumeById,
      getHistoryById,
      deleteHistoryItem,
      fetchAnalysisStatus,
      matchResume,
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
