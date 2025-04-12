import { elizaLogger, generateObjectDeprecated } from "@elizaos/core"; // Eliza OS의 로깅 유틸리티 가져오기
import fs from "fs";
import {
    ActionExample,
    Content,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    ModelClass,
    type Action,
} from "@elizaos/core"; // Eliza OS의 핵심 타입과 인터페이스 가져오기
import { composeContext } from "@elizaos/core"; // 컨텍스트 생성 유틸리티 가져오기
import FormData from "form-data";
import axios from 'axios';
// 입금 내용의 인터페이스 정의, Content를 확장
export interface DocumentParseContent extends Content {
    action: "string"
}


// 타입 가드: 주어진 내용이 DepositContent인지 확인
function isDocumentParseContent(content: any): content is DocumentParseContent {
    console.log("Content for Parse", content); // 디버깅용 콘솔 로그
    return (
        (typeof content.action === "string")
    );
}

// 템플릿에서 추출한 변수 이름과 interface와 변수 이름이 차이가 나면 매칭을 시켜주지 않는다..!!!!!!!!

// 메시지에서 입금 정보를 추출하기 위한 템플릿
const parseTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "action": "please parse this document",
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested parse document:
- action

Respond with a JSON markdown block containing only the extracted values.`;

// 액션 정의
export default {
    name: "DOCUMENT_PARSE", // 액션 이름
    similes: ["PARSING", "DOCUMENT", "PARSE", "document_parsing", "document_parse"], // 이 액션을 트리거할 수 있는 유사 표현
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        console.log("Validating bridging from user:", message.userId); // 사용자 ID로 브리징 유효성 검사 로그
        return true; // 항상 유효로 간주
    },
    description: "parse document to understand and learn effectively", // 액션 설명
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        console.log("Starting DOCUMENT_PARSE handler..."); // 핸들러 시작 로그
        if (!state) {
            state = (await runtime.composeState(message)) as State; // 상태가 없으면 메시지로 상태 구성
        } 

        // 입금 컨텍스트 생성
        const documentParseContext = composeContext({
            state,
            template: parseTemplate,
        });
        // AI 모델을 사용해 입금 내용 생성
        const content = await generateObjectDeprecated({
            runtime,
            context: documentParseContext,
            modelClass: ModelClass.SMALL, // 작은 모델 사용
        });

        const API_KEY = runtime.getSetting("UPSTAGE_API_KEY")
        console.log(API_KEY)
        if (!API_KEY) {
            console.error("api_key not settinged")
        }
        try {
            // 메인 로직
            const FILE_PATH = message.content.attachments[0].url
            console.log("path", FILE_PATH)
            const formData = new FormData();
            formData.append("document", fs.createReadStream(FILE_PATH));
            formData.append("output_formats", JSON.stringify(["html", "text"]));
            formData.append("base64_encoding", JSON.stringify(["table"]));
            formData.append("ocr", "auto");
            formData.append("coordinates", "true");
            formData.append("model", "document-parse");
            console.log("formData:", formData)
            try {
                const response = await axios({
                    url: "https://api.upstage.ai/v1/document-ai/document-parse", // 올바른 엔드포인트
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${API_KEY}`,
                      // FormData가 자동으로 Content-Type을 설정하므로 추가 헤더 불필요
                    },
                    data: formData, // axios에서는 body 대신 data 사용
                  });
    console.log(await response);
    callback({text: `${response}`})
  } catch (error) {
    console.error("Error:", error);
    callback({text: "it has error occurred"})
  }

            return true; // 성공 반환
        } catch (error) {
            console.error("Error during token bridge:", error); // 오류 로그
            if (callback) {
                callback({
                    text: `Error bridging tokens: ${error.message}`, // 오류 메시지
                    content: { error: error.message },
                });
            }
            return false; // 실패 반환
        }
    },

    examples: [
        [
            {
                user: "{{name1}}",
                content: {
                    text: "please",
                },
            },
            {
                user: "{{name2}}",
                content: {
                    text: "I'll send 69 USDC tokens now... from: arbitrum, to: base",
                    action: "BRIDGE_DEPOSIT",
                },
            },
            {
                user: "{{name2}}",
                content: {
                    text: "Successfully bridged 69 USDC tokens to 0x4f2e63be8e7fe287836e29cde6f3d5cbc96eefd0c0e3f3747668faa2ae7324b0, Transaction: 0x39a8c432d9bdad993a33cc1faf2e9b58fb7dd940c0425f1d6db3997e4b4b05c0",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;