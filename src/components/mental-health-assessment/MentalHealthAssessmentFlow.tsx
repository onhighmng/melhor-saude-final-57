import React, { useState } from 'react';
import TopicSelection from './TopicSelection';
import SymptomSelection from './SymptomSelection';
import AssessmentResult from './AssessmentResult';
import MentalHealthChatInterface from './MentalHealthChatInterface';

type Step = 'topics' | 'symptoms' | 'result' | 'chat';

interface MentalHealthAssessment {
  selectedTopics: string[];
  selectedSymptoms: string[];
  additionalNotes: string;
}

interface MentalHealthAssessmentFlowProps {
  onBack: () => void;
  onComplete: () => void;
  onChooseHuman: (assessment: MentalHealthAssessment) => void;
}

const MentalHealthAssessmentFlow: React.FC<MentalHealthAssessmentFlowProps> = ({
  onBack,
  onComplete,
  onChooseHuman
}) => {
  const [step, setStep] = useState<Step>('topics');
  const [assessment, setAssessment] = useState<MentalHealthAssessment>({
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
            onNext={() => setStep('symptoms')}
            onBack={onBack}
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
            onBack={() => setStep('topics')}
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
          <MentalHealthChatInterface
            assessment={assessment}
            onBack={() => setStep('result')}
            onComplete={() => onChooseHuman(assessment)}
            onChooseHuman={() => onChooseHuman(assessment)}
          />
        );
      
      default:
        return null;
    }
  };

  return renderStep();
};

export default MentalHealthAssessmentFlow;
