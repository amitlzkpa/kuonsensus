import { useRef, useEffect } from 'react';

export const useLLMRef = () => {
  const llmRef = useRef(null);

  useEffect(() => {
    const createLLM = async () => {
      llmRef.current = await ai.languageModel.create();
    };

    createLLM();
  }, []);

  return llmRef;
};