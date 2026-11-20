'use client';

import React, { useState } from 'react';
import { Star, Send, X, CheckCircle2, MessageSquare } from 'lucide-react';
import { AccessibilityFeedback } from '@/types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  companyName?: string;
}

type FeedbackType = 'APPLICATION' | 'INTERVIEW' | 'WORKPLACE';

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  jobTitle = 'Accessible UI Engineer', 
  companyName = 'AccessiCorp' 
}: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('INTERVIEW');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback: AccessibilityFeedback = {
      id: `fb-${Date.now()}`,
      jobId: 'job-0',
      candidateProfileId: 'cand-demo',
      type: feedbackType,
      rating,
      feedbackText: feedbackText || 'Great accessibility support during interview.',
      submittedAt: new Date().toISOString()
    };

    // Store in localStorage
    const existing = localStorage.getItem('openability_feedback_list');
    const list = existing ? JSON.parse(existing) : [];
    list.push(feedback);
    localStorage.setItem('openability_feedback_list', JSON.stringify(list));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#163B73]/25 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#DCE5F0] rounded-[20px] p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#718096] hover:text-[#172033] p-1 rounded-lg hover:bg-[#F1F5FA] transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EAF2FF] text-[#2F6FED]">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#172033]">
                Accessibility Experience Feedback
              </h3>
              <p className="text-xs text-[#718096]">
                {jobTitle} • {companyName}
              </p>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#16A36A] mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-[#172033]">Thank you for your rating!</h4>
            <p className="text-xs text-[#718096]">Your feedback helps improve inclusive hiring practices.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Feedback Stage Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033]">Touchpoint Evaluated</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'APPLICATION', label: 'Application' },
                  { id: 'INTERVIEW', label: 'Interview' },
                  { id: 'WORKPLACE', label: 'Workplace' },
                ] satisfies { id: FeedbackType; label: string }[]).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFeedbackType(item.id)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      feedbackType === item.id
                        ? 'border-[#2F6FED] bg-[#EAF2FF] text-[#2F6FED]'
                        : 'border-[#DCE5F0] bg-white text-[#4B5870] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033]">Accommodation Quality</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded-lg hover:bg-[#F4F8FF] transition text-[#D98A00]"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-current text-[#D98A00]' : 'text-[#DCE5F0]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033]">Details or Suggestions</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your experience with accommodations, captions, or interview format..."
                rows={3}
                className="w-full bg-white border border-[#DCE5F0] rounded-xl p-3 text-xs text-[#172033] focus:border-[#2F6FED] focus:ring-2 focus:ring-[#2F6FED]/20"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DCE5F0]">
              <button
                type="button"
                onClick={onClose}
                className="button-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
