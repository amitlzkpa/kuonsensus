import React, { useEffect, useState } from "react";
import { Button } from '@mantine/core';
import sampleStakeHolders from "../assets/samples/a1_stakeHolders.json";

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

  const stakeHolders = csvToJson(llmResponse);
  return stakeHolders;
};

const promptForSideEffectsIdentification = `
For the issue described below, please provide a list of 3-4 possible side-effects of the proposed change for the given stakeholder.
Provide a short title of the side-effect and the implication - whether it is good, bad or neutral to the stakeholder's interests - and include a reason for the implication.
You can have the same side-effect for multiple stakeholders.
You can have the same side-effect with different implications for the same stakeholder. Keep each side-effect, implication and its reasoning separate.
Don't use any special characters or text-formatting.
Return the response in simple English.
Format it as a CSV with the following columns: sideEffectTitle,stakeholderName,implication,implicationReason.

## Sample Response
sideEffectTitle,stakeholderName,implication,implicationReason
Increased Costs,Investors,Bad,"Increased costs can reduce the return on investment for investors, impacting their financial interests."
Increased Costs,Regulatory Authorities,Neutral,"Increased costs may lead to higher compliance with regulations, which can be beneficial for regulatory authorities."
Increased Costs,Local Community,Bad,"Increased costs may lead to higher prices for goods and services, impacting the local community negatively."
Increased Costs,Project Team,Bad,"Increased costs can affect the project budget and timeline, creating challenges for the project team."
Improved Air Quality,Local Community,Good,"Tree planting can improve air quality, benefiting the health and well-being of the local community."
Reduced Energy Costs,Investors,Good,"Renewable energy systems can reduce long-term energy costs, providing financial benefits to investors."
Enhanced Biodiversity,Regulatory Authorities,Good,"Contributions to local conservation funds can enhance biodiversity, aligning with regulatory authorities' environmental goals."
Job Creation,Local Community,Good,"New construction projects can create job opportunities for the local community, boosting the local economy."

## Issue:

{__issueText__}

## Stakeholder:

{__stakeholderName__}
`;

const extractSideEffects = async (inText, stakeHolder, llmRef) => {
  const promptText = promptForSideEffectsIdentification
    .replace("{__issueText__}", inText)
    .replace("{__stakeholderName__}", stakeHolder.stakeholderName);

  const llmResponse = await llmRef?.current?.prompt(promptText);
  return csvToJson(llmResponse);
};

export default function Dev() {
  const [inText, setInText] = useState(sampleStartingPrompt);
  const [outText, setOutText] = useState("");
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
        allSideEffects.push({
          proposal: inText,
          stakeHolder,
          sideEffects
        });
      }

      const json = allSideEffects;

      setOutText(JSON.stringify(json, null, 2));
    } catch (error) {
      console.log(error?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setInText("");
    setOutText("");
  };

  return (
    <div>
      <div>
        <textarea
          onChange={(e) => setInText(e.target.value)}
          value={inText}
          placeholder="Enter text here"
        />
        <div>
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
            <div>
              ...
            </div>
          ) : (
            <></>
          )}
        </div>

        <hr />

        <pre>{outText}</pre>
      </div>
    </div>
  );
}
