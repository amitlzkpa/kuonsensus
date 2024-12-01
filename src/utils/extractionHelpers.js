import { z } from "zod";
import csvToJson from "convert-csv-to-json";

let DEBUG_LLM = true;

const makeCallsTillSuccess = async (
  fnLabel,
  fn,
  maxAttempts,
  fallbackValue
) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fn();
      return response;
    } catch (error) {
      if (DEBUG_LLM)
        console.log(`Error in ${fnLabel} attempt ${i + 1}: ${error.message}`);
    }
  }
  return fallbackValue;
};

const StakeholderSchema = z.object({
  stakeHolderName: z.string().min(2),
  description: z.string(),
});

const StakeholdersSchema = z.array(StakeholderSchema);

const SideEffectSchema = z.object({
  sideEffectTitle: z.string().min(2),
  stakeHolderName: z.string().min(2),
  implication: z.string().min(2),
  implicationReason: z.string(),
});

const SideEffectsSchema = z.array(SideEffectSchema);

const getTypeVerifiedLLMResponse = (llmResponseObj, schema) => {
  const verifiedResponse = schema.parse(llmResponseObj);
  return verifiedResponse;
};

const promptForStakeholderIdentification = `
For the issue described below, please provide a list of 3-7 stakeholders that should be identified and consulted for input.
Provide a brief description of the stakeholder and the reason for their inclusion in the format below.
If there are any names, teams, groups, organizations or titles mentioned as being relevant, make sure they are included individually as a stakeholder.
Don't use any special characters or text-formatting.
Return the response in simple English.
Format it as a CSV with the following headers: stakeholderName,description.
Don't include the header row in the response.
Return only the csv string in the response.
Do not use any commas within individual text values.

## Sample Response
"Investors","Investors are key stakeholders in the project as they provide the necessary funding for the project. Their input is critical for decision-making and project success."
"Regulatory Authorities","Regulatory authorities are responsible for ensuring compliance with laws and regulations. Their input is necessary to ensure that the project meets all legal requirements."
"Local Community","The local community is directly impacted by the project. Their input is important to address any concerns and ensure that the project benefits the community."
"Project Team","The project team is responsible for executing the project. Their input is essential for planning and implementation."

## Issue:
{__issueText__}
`;

export const extractStakeholders = async (inText, llmRef) => {
  if (DEBUG_LLM) console.log("-------extractStakeholders");

  const callLLM_extractStakeholders = async () => {
    const promptText = promptForStakeholderIdentification.replace(
      "{__issueText__}",
      inText
    );
    if (DEBUG_LLM) console.log(promptText);
    let llmResponse = await llmRef?.current?.prompt(promptText);
    if (DEBUG_LLM) console.log(llmResponse);

    llmResponse = '"stakeHolderName","description"\n' + llmResponse;

    const responseJson = csvToJson
      .fieldDelimiter(",")
      .supportQuotedField(true)
      .csvStringToJson(llmResponse);

    if (DEBUG_LLM) console.log(responseJson);

    const stakeHoldersArray = getTypeVerifiedLLMResponse(
      responseJson,
      StakeholdersSchema
    );

    return stakeHoldersArray;
  };

  const stakeHolders = await makeCallsTillSuccess(
    "extractStakeholders",
    callLLM_extractStakeholders,
    6,
    []
  );

  if (DEBUG_LLM) console.log("-------extractStakeholders");
  return stakeHolders;
};

const promptForPositiveSideEffectsIdentification = `
For the issue described below, please provide a list of 3-4 possible good side-effects of the proposed change for the given stakeholder.
Provide a short title of the side-effect and include a reason as to why it affects the stakeholder positively.
The side-effect should necessarily affect the stakeholder positively.
Each side-effect should be unique and different. Keep each side-effect and its reasoning separate.
Don't use any special characters or text-formatting.
Return the response in simple English.
Format it as a CSV.
Use only 2 values for each record with the following keys for the column headers: "sideEffectTitle","implicationReason"
Don't include the header row in the response.
Return only the csv string in the response.
Do not use any commas within individual text values.
Return only the csv string in the response.

## Sample Response
"Improved Air Quality","Tree planting can improve air quality, benefiting the health and well-being of the local community"
"Reduced Energy Costs","Renewable energy systems can reduce long-term energy costs, providing financial benefits to investors"
"Enhanced Biodiversity","Contributions to local conservation funds can enhance biodiversity, aligning with regulatory authorities' environmental goals"
"Job Creation","New construction projects can create job opportunities for the local community, boosting the local economy"

## Issue:

{__issueText__}

## Stakeholder:

{__stakeHolderName__}
`;

const promptForNegativeSideEffectsIdentification = `
For the issue described below, please provide a list of 3-4 possible bad side-effects of the proposed change for the given stakeholder.
Provide a short title of the side-effect and include a reason as to why it affects the stakeholder negatively.
The side-effect should necessarily affect the stakeholder negatively.
Each side-effect should be unique and different. Keep each side-effect and its reasoning separate.
Don't use any special characters or text-formatting.
Return the response in simple English.
Format it as a CSV.
Use only 2 values for each record with the following keys for the column headers: "sideEffectTitle","implicationReason"
Don't include the header row in the response.
Return only the csv string in the response.
Do not use any commas within individual text values.
Return only the csv string in the response.

## Sample Response
"Increased Financial Costs","Increased costs can reduce the return on investment for investors, impacting their financial interests"
"Higher Prices","Increased costs may lead to higher prices for goods and services, impacting the local community negatively"
"Budget Strain","Increased costs can affect the project budget and timeline, creating challenges for the project team"

## Issue:

{__issueText__}

## Stakeholder:

{__stakeHolderName__}
`;

const extractPositiveSideEffects = async (inText, stakeHolder, llmRef) => {
  if (DEBUG_LLM) console.log("-------extractPositiveSideEffects");

  const callLLM_extractPositiveSideEffects = async () => {
    const promptText_PositiveSideEffects =
      promptForPositiveSideEffectsIdentification
        .replace("{__issueText__}", inText)
        .replace("{__stakeHolderName__}", stakeHolder.stakeHolderName);

    if (DEBUG_LLM) console.log(promptText_PositiveSideEffects);

    let llmResponse = await llmRef?.current?.prompt(
      promptText_PositiveSideEffects
    );

    llmResponse = '"sideEffectTitle","implicationReason"\n' + llmResponse;

    if (DEBUG_LLM) console.log(llmResponse);

    const responseJson = csvToJson
      .fieldDelimiter(",")
      .supportQuotedField(true)
      .csvStringToJson(llmResponse);
    const reshapedResponse = responseJson.map((se) => ({
      ...se,
      stakeHolderName: stakeHolder.stakeHolderName,
      implication: "positive",
    }));

    if (DEBUG_LLM) console.log(reshapedResponse);

    const sideEffectsArray = getTypeVerifiedLLMResponse(
      reshapedResponse,
      SideEffectsSchema
    );

    return sideEffectsArray;
  };

  const sideEffectsArray = await makeCallsTillSuccess(
    "extractPositiveSideEffects",
    callLLM_extractPositiveSideEffects,
    6,
    []
  );

  if (DEBUG_LLM) console.log("-------extractPositiveSideEffects");
  return sideEffectsArray;
};

const extractNegativeSideEffects = async (inText, stakeHolder, llmRef) => {
  if (DEBUG_LLM) console.log("-------extractNegativeSideEffects");

  const callLLM_extractNegativeSideEffects = async () => {
    const promptText_NegativeSideEffects =
      promptForNegativeSideEffectsIdentification
        .replace("{__issueText__}", inText)
        .replace("{__stakeHolderName__}", stakeHolder.stakeHolderName);

    if (DEBUG_LLM) console.log(promptText_NegativeSideEffects);

    let llmResponse = await llmRef?.current?.prompt(
      promptText_NegativeSideEffects
    );

    llmResponse = '"sideEffectTitle","implicationReason"\n' + llmResponse;

    if (DEBUG_LLM) console.log(llmResponse);

    const responseJson = csvToJson
      .fieldDelimiter(",")
      .supportQuotedField(true)
      .csvStringToJson(llmResponse);
    const reshapedResponse = responseJson.map((se) => ({
      ...se,
      stakeHolderName: stakeHolder.stakeHolderName,
      implication: "negative",
    }));

    if (DEBUG_LLM) console.log(reshapedResponse);

    const sideEffectsArray = getTypeVerifiedLLMResponse(
      reshapedResponse,
      SideEffectsSchema
    );

    return sideEffectsArray;
  };

  const sideEffectsArray = await makeCallsTillSuccess(
    "extractNegativeSideEffects",
    callLLM_extractNegativeSideEffects,
    6,
    []
  );

  if (DEBUG_LLM) console.log("-------extractNegativeSideEffects");
  return sideEffectsArray;
};

export const extractSideEffects = async (inText, stakeHolder, llmRef) => {
  const positiveSideEffects = await extractPositiveSideEffects(
    inText,
    stakeHolder,
    llmRef
  );
  const negativeSideEffects = await extractNegativeSideEffects(
    inText,
    stakeHolder,
    llmRef
  );
  const sideEffects = [...positiveSideEffects, ...negativeSideEffects];
  return sideEffects;
};

const promptForBoardDescriptionGeneration = `
Provide a 2-3-line description for a proposal around the issue described below.
Don't use any special characters or text-formatting.
Return the response in simple English.
Do not use any punctuations in the title.
Return only the title in the response.

## Sample Response
Proposal to implement a renewable energy project. The project aims to reduce carbon emissions and promote sustainability. The project will involve the installation of solar panels and energy-efficient systems.
Proposal to launch a fundraising campaign for a local charity. The campaign aims to raise funds for community projects and support underprivileged groups. The campaign will involve online and offline fundraising activities.
Proposal to develop a community outreach program for at-risk youth. The program aims to provide mentorship and support to young people in need. The program will involve workshops, training sessions, and community events.

## Issue:
{__issueText__}
`;

export const generateDescription = async (inText, llmRef) => {
  if (DEBUG_LLM) console.log("-------generateDescription");

  const callLLM_generateDescription = async () => {
    const promptText = promptForBoardDescriptionGeneration.replace(
      "{__issueText__}",
      inText
    );
    if (DEBUG_LLM) console.log(promptText);
    let llmResponse = await llmRef?.current?.prompt(promptText);
    if (DEBUG_LLM) console.log(llmResponse);
    return llmResponse;
  };

  const generatedDescription = await makeCallsTillSuccess(
    "generateDescription",
    callLLM_generateDescription,
    3,
    ""
  );

  if (DEBUG_LLM) console.log("-------generateDescription");
  return generatedDescription;
};

const promptForBoardNameGeneration = `
Provide a short title for the issue described below.
Don't use any special characters or text-formatting.
Return the response in simple English.
Do not use any punctuations in the title.
Return only the title in the response.

## Sample Response
Renewable Energy Project
Fundraising Campaign
Community Outreach Program
Project Management Software Upgrade

## Issue:
{__issueText__}
`;

export const generateTitle = async (inText, llmRef) => {
  if (DEBUG_LLM) console.log("-------generateTitle");

  const callLLM_generateTitle = async () => {
    const promptText = promptForBoardNameGeneration.replace(
      "{__issueText__}",
      inText
    );
    if (DEBUG_LLM) console.log(promptText);
    let llmResponse = await llmRef?.current?.prompt(promptText);
    if (DEBUG_LLM) console.log(llmResponse);
    return llmResponse;
  };

  const generatedTitle = await makeCallsTillSuccess(
    "generateTitle",
    callLLM_generateTitle,
    3,
    "untitled"
  );

  if (DEBUG_LLM) console.log("-------generateTitle");
  return generatedTitle;
};
