import React, { useEffect, useState } from "react";
import { Button, Center, Container, Flex, JsonInput, Space, Textarea } from '@mantine/core';

import { extractStakeholders, extractSideEffects } from "../utils/extractionHelpers";

import MorphingSvg from "../components/MorphingSvg";

import sampleStakeHolders from "../assets/samples/a1_stakeHolders.json";

const sampleStartingPrompt = `
In order to address environmental concerns from new construction,
propose requiring developers to include measures such as
- tree planting
- renewable energy systems
- contributions to local conservation funds
`;

export default function Dev() {
  const [inText, setInText] = useState(sampleStartingPrompt);
  const [outText, setOutText] = useState("{}");
  const [isProcessing, setIsProcessing] = useState(false);

  const llmRef = React.useRef();

  useEffect(() => {
    if (llmRef.current) return;

    (async () => {
      llmRef.current = await ai.languageModel.create();
    })();
  }, []);

  const handleSubmit = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const stakeHolders = await extractStakeholders(inText, llmRef);
      // const stakeHolders = sampleStakeHolders;

      const allSideEffects = [];
      for (const stakeHolder of stakeHolders) {
        let sideEffects = await extractSideEffects(inText, stakeHolder, llmRef);
        allSideEffects.push(sideEffects);
      }

      const json = { allSideEffects, stakeHolders };

      console.log(json);

      setOutText(JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(error?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setInText("");
    setOutText("{}");
  };

  return (
    <Container fluid>

      <Center>
        <MorphingSvg />
      </Center>

      <Space h="md" />

      <Textarea
        onChange={(e) => setInText(e.currentTarget.value)}
        value={inText}
        placeholder="Enter text here"
        autosize
        minRows={4}
        maxRows={12}
      />

      <Space h="md" />

      <Flex
        gap="sm"
        justify="flex-start"
        align="center"
        direction="row"
      >
        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
        >
          Submit
        </Button>
        <Button
          onClick={handleReset}
          disabled={isProcessing}
        >
          Reset
        </Button>
        {isProcessing ? (
          <Container>
            ...
          </Container>
        ) : (
          <></>
        )}
      </Flex>

      <Space h="md" />

      <JsonInput
        value={outText}
        autosize
        minRows={4}
        maxRows={12}
      />
    </Container>
  );
}
