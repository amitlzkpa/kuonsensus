import React, { useEffect, useState } from 'react';
import { useDebounce } from "@uidotdev/usehooks";
import { FaPen } from 'react-icons/fa';
import { Input } from '@mantine/core';

import { useLLMRef } from "../hooks/llmRef";

export const PromptReady_TextInput = ({
  height = "2.25rem",
  enableAiGeneration = true,
  promptBase = "",
  promptSamples = "",
  onChange_debounced,
  onGeneratedValueChange,
  inputProps = {},
}) => {

  const llmRef = useLLMRef();

  const [inputValue, setInputValue] = useState(inputProps?.value ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedValue, setGeneratedValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 500);

  useEffect(() => {
    if (onChange_debounced) {
      onChange_debounced(debouncedInputValue);
    }
  }, [debouncedInputValue, onChange_debounced]);

  const handleGenerationClick = async () => {
    if (llmRef.current) {
      try {
        setIsGenerating(true);
        setGeneratedValue("");
        const inputGenPromptText = [
          "## Instructions:",
          promptBase ?? "",
          "",
          "## Samples:",
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
    <div style={{ position: "relative", height }}>
      <Input
        style={{ position: "absolute", top: 0, right: 0, left: 0, bottom: 0 }}
        {...inputProps}
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
        disabled={isGenerating}
      />
      {
        enableAiGeneration
          ?
          (

            <div
              onClick={handleGenerationClick}
              style={{ position: "absolute", top: "15%", right: 15, cursor: "pointer" }}
            >
              <FaPen size="0.6rem" color="primary" />
            </div>
          )
          :
          (
            <></>
          )
      }
    </div>
  );
}

export default PromptReady_TextInput;