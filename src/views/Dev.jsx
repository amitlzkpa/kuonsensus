import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Button, Center, Container, Flex, JsonInput, Space, Textarea } from '@mantine/core';
import { FaBeer } from "react-icons/fa";
import { animated, useIsomorphicLayoutEffect, useSpring } from "@react-spring/web";

import sampleStakeHolders from "../assets/samples/a1_stakeHolders.json";

const StakeholderSchema = z.object({
  stakeholderName: z.string().min(2),
  description: z.string(),
});

const StakeholdersSchema = z.array(StakeholderSchema);

const SideEffectSchema = z.object({
  sideEffectTitle: z.string().min(2),
  stakeholderName: z.string().min(2),
  implication: z.string().min(2),
  implicationReason: z.string(),
});

const SideEffectsSchema = z.array(SideEffectSchema);

const getTypeVerifiedLLMResponse = (llmResponseObj, schema) => {
  try {
    const verifiedResponse = schema.parse(llmResponseObj);
    return verifiedResponse;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const sampleStartingPrompt = `
In order to address environmental concerns from new construction,
propose requiring developers to include measures such as
- tree planting
- renewable energy systems
- contributions to local conservation funds
`;

function csvToJson(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  const result = lines.slice(1).map((line) => {
    const values = line.split(",");
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index].trim();
      return obj;
    }, {});
  });
  return result;
}

const promptForStakeholderIdentification = `
For the issue described below, please provide a list of 3-4 stakeholders that should be identified and consulted for input.
Provide a brief description of the stakeholder and the reason for their inclusion in the format below.
Don't use any special characters or text-formatting.
Return the response in simple English.
Format it as a CSV with the following columns: stakeholderName,description.

## Sample Response
stakeholderName,description
Investors,"Investors are key stakeholders in the project as they provide the necessary funding for the project. Their input is critical for decision-making and project success."
Regulatory Authorities,"Regulatory authorities are responsible for ensuring compliance with laws and regulations. Their input is necessary to ensure that the project meets all legal requirements."
Local Community,"The local community is directly impacted by the project. Their input is important to address any concerns and ensure that the project benefits the community."
Project Team,"The project team is responsible for executing the project. Their input is essential for planning and implementation."

## Issue:
{__issueText__}
`;

const extractStakeholders = async (inText, llmRef) => {
  const promptText = promptForStakeholderIdentification.replace(
    "{__issueText__}",
    inText
  );
  const llmResponse = await llmRef?.current?.prompt(promptText);
  const responseJson = csvToJson(llmResponse);
  const stakeHoldersArray = getTypeVerifiedLLMResponse(responseJson, StakeholdersSchema);
  return stakeHoldersArray;
};

const promptForPositiveSideEffectsIdentification = `
For the issue described below, please provide a list of 3-4 possible good side-effects of the proposed change for the given stakeholder.
Provide a short title of the side-effect and include a reason as to why it affects the stakeholder positively.
The side-effect should necessarily affect the stakeholder positively.
Each side-effect should be unique and different. Keep each side-effect and its reasoning separate.
Don't use any special characters or text-formatting.
Return the response in simple English.
Format it as a CSV with the following columns: sideEffectTitle,stakeholderName,implicationReason.

## Sample Response
sideEffectTitle,stakeholderName,implicationReason
"Improved Air Quality","Local Community","Tree planting can improve air quality, benefiting the health and well-being of the local community"
"Reduced Energy Costs","Investors","Renewable energy systems can reduce long-term energy costs, providing financial benefits to investors"
"Enhanced Biodiversity","Regulatory Authorities","Contributions to local conservation funds can enhance biodiversity, aligning with regulatory authorities' environmental goals"
"Job Creation","Local Community","New construction projects can create job opportunities for the local community, boosting the local economy"

## Issue:

{__issueText__}

## Stakeholder:

{__stakeholderName__}
`;

const promptForNegativeSideEffectsIdentification = `
For the issue described below, please provide a list of 3-4 possible bad side-effects of the proposed change for the given stakeholder.
Provide a short title of the side-effect and include a reason as to why it affects the stakeholder negatively.
The side-effect should necessarily affect the stakeholder negatively.
Each side-effect should be unique and different. Keep each side-effect and its reasoning separate.
Don't use any special characters or text-formatting.
Return the response in simple English.
Format it as a CSV with the following columns: sideEffectTitle,stakeholderName,implicationReason.


## Sample Response
sideEffectTitle,stakeholderName,implicationReason
"Increased Costs","Investors","Increased costs can reduce the return on investment for investors, impacting their financial interests"
"Increased Costs","Local Community","Increased costs may lead to higher prices for goods and services, impacting the local community negatively"
"Increased Costs","Project Team","Increased costs can affect the project budget and timeline, creating challenges for the project team"

## Issue:

{__issueText__}

## Stakeholder:

{__stakeholderName__}
`;

const extractPositiveSideEffects = async (inText, stakeHolder, llmRef) => {
  const promptText_PositiveSideEffects = promptForPositiveSideEffectsIdentification
    .replace("{__issueText__}", inText)
    .replace("{__stakeholderName__}", stakeHolder.stakeholderName);

  const llmResponse = await llmRef?.current?.prompt(promptText_PositiveSideEffects);
  const responseJson = csvToJson(llmResponse);
  const reshapedResponse = responseJson.map((se) => ({ ...se, implication: "positive" }));
  const sideEffectsArray = getTypeVerifiedLLMResponse(reshapedResponse, SideEffectsSchema);
  return sideEffectsArray;
};

const extractNegativeSideEffects = async (inText, stakeHolder, llmRef) => {
  const promptText_NegativeSideEffects = promptForNegativeSideEffectsIdentification
    .replace("{__issueText__}", inText)
    .replace("{__stakeholderName__}", stakeHolder.stakeholderName);

  const llmResponse = await llmRef?.current?.prompt(promptText_NegativeSideEffects);
  const responseJson = csvToJson(llmResponse);
  const reshapedResponse = responseJson.map((se) => ({ ...se, implication: "negative" }));
  const sideEffectsArray = getTypeVerifiedLLMResponse(reshapedResponse, SideEffectsSchema);
  return sideEffectsArray;
};

const extractSideEffects = async (inText, stakeHolder, llmRef) => {
  const positiveSideEffects = await extractPositiveSideEffects(inText, stakeHolder, llmRef);
  const negativeSideEffects = await extractNegativeSideEffects(inText, stakeHolder, llmRef);
  const sideEffects = [...positiveSideEffects, ...negativeSideEffects];
  return sideEffects;
};

export default function Dev() {
  const [inText, setInText] = useState(sampleStartingPrompt);
  const [outText, setOutText] = useState("{}");
  const [isProcessing, setIsProcessing] = useState(false);

  const [springs, api] = useSpring(() => ({
    from: { x: 0 }
  }));

  useIsomorphicLayoutEffect(() => {
    api.start({
      from: {
        x: 0,
      },
      to: {
        x: 100,
      },
    });
  }, []);

  const handleClick = () => {
  };

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
        <animated.div
          style={{
            width: 80,
            height: 80,
            background: '#ff6d6d',
            borderRadius: 8,
            ...springs,
          }}
        />
      </Center>

      <Center h="100" onClick={handleClick}>
        <FaBeer />
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
