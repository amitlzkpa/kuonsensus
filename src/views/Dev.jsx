import React, { useEffect, useState } from "react";

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
For the issue described below, please provide a list of 3-4 stakeholders (as a CSV) that should be identified and consulted for input.
Provide a brief description of the stakeholder and the reason for their inclusion in the format below.

## Sample Response
stakeholderName,description
Investors,"Investors are key stakeholders in the project as they provide the necessary funding for the project. Their input is critical for decision-making and project success."
Regulatory Authorities,"Regulatory authorities are responsible for ensuring compliance with laws and regulations. Their input is necessary to ensure that the project meets all legal requirements."
Local Community,"The local community is directly impacted by the project. Their input is important to address any concerns and ensure that the project benefits the community."
Project Team,"The project team is responsible for executing the project. Their input is essential for planning and implementation."

## Issue:
{__issueText__}
`;

export default function Dev() {
  const [inText, setInText] = useState("");
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
      const promptText = promptForStakeholderIdentification.replace(
        "{__issueText__}",
        inText
      );
      const llmResponse = await llmRef?.current?.prompt(promptText);

      const json = csvToJson(llmResponse);

      console.log(json);
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
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        width: "60%",
        minWidth: 200,
        maxWidth: 1280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}>
        <textarea
          style={{
            width: "100%",
            height: 200
          }}
          onChange={(e) => setInText(e.target.value)}
          placeholder="Enter text here"
        />
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            Submit
          </button>
          <button
            onClick={handleReset}
            disabled={isProcessing}
          >
            Reset
          </button>
          {isProcessing ? (
            <div>
              ...
            </div>
          ) : (
            <></>
          )}
        </div>

        <hr />

        <pre style={{
          overflow: "auto",
          width: "100%",
          maxWidth: 1280,
          maxHeight: 400,
        }} >{outText}</pre>
      </div>
    </div>
  );
}
