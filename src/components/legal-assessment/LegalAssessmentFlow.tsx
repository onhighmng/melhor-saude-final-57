import React, { useState } from 'react';
import TopicSelection from './TopicSelection';
import SpecialistChoice from './SpecialistChoice';
import SymptomSelection from './SymptomSelection';
import AssessmentResult from './AssessmentResult';
import LegalChatInterface from './LegalChatInterface';
import { LegalAssessment } from '@/types/legalAssessment';

type Step = 'topics' | 'specialist-choice' | 'symptoms' | 'result' | 'chat';

interface LegalAssessmentFlowProps {
  onBack: () => void;
  onComplete: () => void;
  onChooseHuman: () => void;
}

const LegalAssessmentFlow: React.FC<LegalAssessmentFlowProps> = ({
  onBack,
  onComplete,
  onChooseHuman
}) => {
  const [step, setStep] = useState<Step>('topics');
  const [assessment, setAssessment] = useState<LegalAssessment>({
    selectedTopics: [],
    selectedSymptoms: [],
    additionalNotes: ''
  });

  const handleTopicToggle = (topicId: string) => {
    setAssessment(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter(id => id !== topicId)
        : [...prev.selectedTopics, topicId]
    }));
  };

  const handleSymptomToggle = (symptomId: string) => {
    setAssessment(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptomId)
        ? prev.selectedSymptoms.filter(id => id !== symptomId)
        : [...prev.selectedSymptoms, symptomId]
    }));
  };

  const handleNotesChange = (notes: string) => {
    setAssessment(prev => ({ ...prev, additionalNotes: notes }));
  };

  const renderStep = () => {
    switch (step) {
      case 'topics':
        return (
          <TopicSelection
            selectedTopics={assessment.selectedTopics}
            onTopicToggle={handleTopicToggle}
            onNext={() => setStep('specialist-choice')}
            onBack={onBack}
          />
        );
      
      case 'specialist-choice':
        return (
          <SpecialistChoice
            onChooseAI={() => setStep('symptoms')}
            onChooseHuman={onChooseHuman}
            onBack={() => setStep('topics')}
          />
        );
      
      case 'symptoms':
        return (
          <SymptomSelection
            selectedTopics={assessment.selectedTopics}
            selectedSymptoms={assessment.selectedSymptoms}
            onSymptomToggle={handleSymptomToggle}
            additionalNotes={assessment.additionalNotes || ''}
            onNotesChange={handleNotesChange}
            onNext={() => setStep('result')}
            onBack={() => setStep('specialist-choice')}
          />
        );
      
      case 'result':
        return (
          <AssessmentResult
            selectedTopics={assessment.selectedTopics}
            selectedSymptoms={assessment.selectedSymptoms}
            additionalNotes={assessment.additionalNotes}
            onStartChat={() => setStep('chat')}
            onBack={() => setStep('symptoms')}
          />
        );
      
      case 'chat':
        return (
          <LegalChatInterface
            assessment={assessment}
            onBack={() => setStep('result')}
            onComplete={onComplete}
          />
        );
      
      default:
        return null;
    }
  };

  return renderStep();
};

export default LegalAssessmentFlow;
