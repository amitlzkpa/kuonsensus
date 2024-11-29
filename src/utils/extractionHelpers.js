import { z } from "zod";
import csvToJson from "convert-csv-to-json";

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

const promptForStakeholderIdentification = `
For the issue described below, please provide a list of 3-4 stakeholders that should be identified and consulted for input.
Provide a brief description of the stakeholder and the reason for their inclusion in the format below.
Don't use any special characters or text-formatting.
Return the response in simple English.
Format it as a CSV with the following headers: stakeholderName,description.
Make sure to include the header row in the response.
Return only the csv string in the response.
Do not use any commas in "stakeholderName" or "description" text values.

## Sample Response
"stakeholderName","description"
"Investors","Investors are key stakeholders in the project as they provide the necessary funding for the project. Their input is critical for decision-making and project success."
"Regulatory Authorities","Regulatory authorities are responsible for ensuring compliance with laws and regulations. Their input is necessary to ensure that the project meets all legal requirements."
"Local Community","The local community is directly impacted by the project. Their input is important to address any concerns and ensure that the project benefits the community."
"Project Team","The project team is responsible for executing the project. Their input is essential for planning and implementation."

## Issue:
{__issueText__}
`;

export const extractStakeholders = async (inText, llmRef) => {
  const promptText = promptForStakeholderIdentification.replace(
    "{__issueText__}",
    inText
  );
  const llmResponse = await llmRef?.current?.prompt(promptText);

  const responseJson = csvToJson
    .fieldDelimiter(",")
    .supportQuotedField(true)
    .csvStringToJson(llmResponse);

  const stakeHoldersArray = getTypeVerifiedLLMResponse(
    responseJson,
    StakeholdersSchema
  );
  return stakeHoldersArray;
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
Make sure to include the header row in the response.
Return only the csv string in the response.
Do not use any commas in "sideEffectTitle" or "implicationReason" text values.

## Sample Response
"sideEffectTitle","implicationReason"
"Improved Air Quality","Tree planting can improve air quality, benefiting the health and well-being of the local community"
"Reduced Energy Costs","Renewable energy systems can reduce long-term energy costs, providing financial benefits to investors"
"Enhanced Biodiversity","Contributions to local conservation funds can enhance biodiversity, aligning with regulatory authorities' environmental goals"
"Job Creation","New construction projects can create job opportunities for the local community, boosting the local economy"

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
Format it as a CSV.
Use only 2 values for each record with the following keys for the column headers: "sideEffectTitle","implicationReason"
Make sure to include the header row in the response.
Return only the csv string in the response.
Do not use any commas in "sideEffectTitle" or "implicationReason" text values.

## Sample Response
"sideEffectTitle","implicationReason"
"Increased Financial Costs","Increased costs can reduce the return on investment for investors, impacting their financial interests"
"Higher Prices","Increased costs may lead to higher prices for goods and services, impacting the local community negatively"
"Budget Strain","Increased costs can affect the project budget and timeline, creating challenges for the project team"

## Issue:

{__issueText__}

## Stakeholder:

{__stakeholderName__}
`;

const extractPositiveSideEffects = async (inText, stakeHolder, llmRef) => {
  const promptText_PositiveSideEffects =
    promptForPositiveSideEffectsIdentification
      .replace("{__issueText__}", inText)
      .replace("{__stakeholderName__}", stakeHolder.stakeholderName);

  const llmResponse = await llmRef?.current?.prompt(
    promptText_PositiveSideEffects
  );

  const responseJson = csvToJson
    .fieldDelimiter(",")
    .supportQuotedField(true)
    .csvStringToJson(llmResponse);
  const reshapedResponse = responseJson.map((se) => ({
    ...se,
    stakeholderName: stakeHolder.stakeholderName,
    implication: "positive",
  }));
  const sideEffectsArray = getTypeVerifiedLLMResponse(
    reshapedResponse,
    SideEffectsSchema
  );
  return sideEffectsArray;
};

const extractNegativeSideEffects = async (inText, stakeHolder, llmRef) => {
  const promptText_NegativeSideEffects =
    promptForNegativeSideEffectsIdentification
      .replace("{__issueText__}", inText)
      .replace("{__stakeholderName__}", stakeHolder.stakeholderName);

  const llmResponse = await llmRef?.current?.prompt(
    promptText_NegativeSideEffects
  );

  const responseJson = csvToJson
    .fieldDelimiter(",")
    .supportQuotedField(true)
    .csvStringToJson(llmResponse);
  const reshapedResponse = responseJson.map((se) => ({
    ...se,
    stakeholderName: stakeHolder.stakeholderName,
    implication: "negative",
  }));
  const sideEffectsArray = getTypeVerifiedLLMResponse(
    reshapedResponse,
    SideEffectsSchema
  );
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
