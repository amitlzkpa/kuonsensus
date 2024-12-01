import React, { useEffect, useState } from 'react';
import { useDebounce } from "@uidotdev/usehooks";
import { FaPen } from 'react-icons/fa';
import { Loader, Textarea } from '@mantine/core';

import { useLLMRef } from "../hooks/llmRef";

export const PromptReady_TextArea = ({
  height = "10rem",
  enableAiGeneration = true,
  promptBase = "",
  promptSamples = "",
  forceEditDisabled = false,
  onChange_debounced,
  onGeneratedValueChange,
  inputValue,
  setInputValue,
  textareaProps = {},
}) => {

  const llmRef = useLLMRef();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedValue, setGeneratedValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (onChange_debounced) {
      onChange_debounced(debouncedInputValue);
    }
  }, [debouncedInputValue, onChange_debounced]);

  const handleGenerationClick = async () => {
    if (isGenerating || forceEditDisabled) return;
    if (llmRef.current) {
      try {
        setIsGenerating(true);
        setGeneratedValue("");
        const inputGenPromptText = [
          "## Prompt Instructions:",
          promptBase ?? "",
          "",
          "## Sample:",
          promptSamples ?? "",
          "",
          "## Strict Instructions:",
          "Return only unformatted response text in English."
        ].join("\n");
        console.log(inputGenPromptText);
        const generatedText = await llmRef.current?.prompt(inputGenPromptText);
        console.log(generatedText);
        setInputValue(generatedText);
        setGeneratedValue(generatedText);
        if (onGeneratedValueChange) {
          onGeneratedValueChange(generatedText);
        }
      } catch (error) {
        console.error(error.message);
      }
      finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div style={{ position: "relative", height, overflowY: "clip" }}>
      <Textarea
        resize="vertical"
        style={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }}
        {...textareaProps}
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
        disabled={isGenerating || forceEditDisabled}
      />
      {
        enableAiGeneration
          ?
          (
            isGenerating
              ?
              (
                <div
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 15,
                    cursor: "not-allowed"
                  }}
                >
                  <Loader size="xs" type="oval" />
                </div>
              )
              :
              (
                <div
                  onClick={handleGenerationClick}
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 15,
                    cursor: "pointer"
                  }}
                >
                  <FaPen size="0.7rem" style={{ color: "#b41220" }} />
                </div>
              )
          )
          :
          (
            <></>
          )
      }
    </div>
  );
};