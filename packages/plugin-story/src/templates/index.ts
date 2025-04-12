export const registerIPTemplate = `Given the recent messages below:

{{recentMessages}}

Extract the following information about the requested IP registration:
- Field "title": The title of your IP
- Field "description": The description of your IP
- Field "ipType": The type of your IP. Type of the IP Asset, can be defined arbitrarily by the
creator. I.e. “character”, “chapter”, “location”, “items”, "music", etc. If a user doesn't provide
an ipType, you can infer it from the title and description. It should be one word.

Respond with a JSON markdown block containing only the extracted values. A user must explicitly provide a title and description.

\`\`\`json
{
    "title": string,
    "description": string,
    "ipType": string
}
\`\`\`
`;

export const licenseIPTemplate = `Given the recent messages below:

{{recentMessages}}

Extract the following information about the requested IP licensing:
- Field "licensorIpId": The IP Asset that you want to mint a license from
- Field "licenseTermsId": The license terms that you want to mint a license for
- Field "amount": The amount of licenses to mint

Respond with a JSON markdown block containing only the extracted values. A user must explicitly provide a licensorIpId and licenseTermsId.
If they don't provide the amount, set it as null.

\`\`\`json
{
    "licensorIpId": string,
    "licenseTermsId": string,
    "amount": number | null
}
\`\`\`
`;

export const getAvailableLicensesTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested IP licensing:
- Field "ipid": The IP Asset that you want to mint a license from

Respond with a JSON markdown block containing only the extracted values. A user must provide an ipId.

\`\`\`json
{
    "ipid": string
}
\`\`\`
`;

export const getIPDetailsTemplate = `Given the recent messages below:

{{recentMessages}}

Extract the following information about the requested IP details:
- Field "ipId": The IP Asset that you want to get details for

Respond with a JSON markdown block containing only the extracted values. A user must provide an ipId.

\`\`\`json
{
    "ipId": string
}
\`\`\`
`;

export const attachTermsTemplate = `Given the recent messages below:

{{recentMessages}}

Extract the following information about attaching license terms to an IP Asset:
- Field "ipId": The IP Asset that you want to attach the license terms to
- Field "mintingFee": The fee to mint this license from the IP Asset.
- Field "commercialUse": Whether or not the IP Asset can be used commercially.
- Field "commercialRevShare": The percentage of revenue that the IP Asset owner will receive
from commercial use of the IP Asset. This must be between 0 and 100. If a user specifies
a commercialRevShare, then commercialUse must be set to true.

Respond with a JSON markdown block containing only the extracted values. A user must provide an ipId. If they don't provide
the others fields, set them as null.

\`\`\`json
{
    "ipId": string,
    "mintingFee": number | null,
    "commercialUse": boolean | null,
    "commercialRevShare": number | null
}
\`\`\`
`;

export const auditTemplate = `Given the recent messages below:

{{recentMessages}}

Analysis Purpose: Compare the artistic style of the two recently sent images.

Extract and analyze the following information:
- Visual characteristics of both images (color, composition, line usage, texture, etc.)
- Whether the artistic styles are similar
- If determined to be similar, provide the registered IP address information. 
- the IP address is already provided in the recent messages. it should be start with 0x

Respond with analysis results in the following JSON format:

\`\`\`json
{
    "isStyleSimilar": boolean,
    "comparisonResult": string,
    "referenceIPAddress": string
}
\`\`\`

Where:
- isStyleSimilar: Whether the artistic styles of the two images are similar (true/false)
- comparisonResult: Detailed explanation of the similarity analysis
- referenceIPAddress: The registered IP address if styles are similar
`;
