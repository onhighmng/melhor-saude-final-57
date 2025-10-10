import React, { useState } from 'react';
import TopicSelection from './TopicSelection';
import SymptomSelection from './SymptomSelection';
import AssessmentResult from './AssessmentResult';

type Step = 'topics' | 'symptoms' | 'result';

interface PhysicalWellnessAssessment {
  selectedTopics: string[];
  selectedSymptoms: string[];
  additionalNotes: string;
}

interface PhysicalWellnessAssessmentFlowProps {
  onBack: () => void;
  onComplete: () => void;
  onChooseHuman: () => void;
}

const PhysicalWellnessAssessmentFlow: React.FC<PhysicalWellnessAssessmentFlowProps> = ({
  onBack,
  onComplete,
  onChooseHuman
}) => {
  const [step, setStep] = useState<Step>('topics');
  const [assessment, setAssessment] = useState<PhysicalWellnessAssessment>({
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
            onStartChat={onChooseHuman}
            onBack={() => setStep('symptoms')}
          />
        );
      
      default:
        return null;
    }
  };

  return renderStep();
};

export default PhysicalWellnessAssessmentFlow;
