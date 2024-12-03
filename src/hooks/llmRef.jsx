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

export const useSummarizerRef = () => {
  const summarizerRef = useRef(null);

  useEffect(() => {
    const createLLM = async () => {
      // summarizerRef.current = await ai.summarizer.create({
      //   sharedContext: "A newspaper article about the latest business news.",
      //   type: "headline",
      //   length: "short"
      // });
      summarizerRef.current = await ai.summarizer.create();
    };

    createLLM();
  }, []);

  return summarizerRef;
};

export const useWriterRef = () => {
  const writerRef = useRef(null);

  useEffect(() => {
    const createLLM = async () => {
      // writerRef.current = await ai.writer.create({
      //   tone: "formal"
      // });
      writerRef.current = await ai.writer.create();
    };

    createLLM();
  }, []);

  return writerRef;
};

export const useRewriterRef = () => {
  const rewriterRef = useRef(null);

  useEffect(() => {
    const createLLM = async () => {
      // rewriterRef.current = await ai.rewriter.create({
      //   sharedContext: "A review for linguistics magazine.",
      // });
      rewriterRef.current = await ai.rewriter.create();
    };

    createLLM();
  }, []);

  return rewriterRef;
};