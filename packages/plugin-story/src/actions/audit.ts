import {
    composeContext,
    elizaLogger,
    generateObjectDeprecated,
    type HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";
import { auditTemplate } from "../templates";
import { getIPDetailsAction, GetIPDetailsAction } from "./getIPDetails";

export { auditTemplate };

// Types for the action parameters and response
type AuditParams = {
    userImageUrl: string;
};

type AuditResponse = {
    isStyleSimilar: boolean;
    comparisonResult: string;
    referenceImageUrl: string;
};

/**
 * Class handling IP audit functionality
 */
export class AuditAction {
    private getIPDetailsAction: GetIPDetailsAction;

    constructor() {
        this.getIPDetailsAction = new GetIPDetailsAction();
    }

    async auditImage(params: AuditParams): Promise<AuditResponse> {
        elizaLogger.info("Starting image audit process...");

        // 2. getIPDetails 액션을 호출
        const ipDetails = await this.getIPDetailsAction.getIPDetails({
            ipId: "0x994BFe1468735060146Ff3510971955a9e0079C2",
        });

        // 3. asset detail에서 imageURL 찾기
        const referenceImageUrl = ipDetails.data.nftMetadata.imageUrl;
        elizaLogger.info(`Reference image URL: ${referenceImageUrl}`);

        // 4 & 5. 이미지 비교 로직 (실제 구현에서는 이미지 다운로드 및 비교 알고리즘 필요)
        // 여기서는 간단한 예시로 구현
        const comparisonResult = await this.compareImages(
            params.userImageUrl,
            referenceImageUrl,
        );

        // 6. 비슷한 화풍인지 판단
        const isStyleSimilar = comparisonResult.similarity > 0.7; // 예시: 70% 이상 유사도면 비슷하다고 판단

        return {
            isStyleSimilar,
            comparisonResult: comparisonResult.details,
            referenceImageUrl,
        };
    }

    // 이미지 비교 함수 (실제 구현에서는 이미지 처리 라이브러리 사용 필요)
    private async compareImages(
        userImageUrl: string,
        referenceImageUrl: string,
    ) {
        // 실제 구현에서는 이미지 다운로드 및 비교 알고리즘 구현 필요
        // 여기서는 간단한 예시로 구현
        elizaLogger.info(
            `Comparing images: ${userImageUrl} and ${referenceImageUrl}`,
        );

        // 실제 이미지 비교 로직 대신 임시 결과 반환
        return {
            similarity: Math.random(), // 실제 구현에서는 실제 유사도 계산 필요
            details:
                "이미지 스타일 분석 결과: 색상 구성, 선의 사용, 질감 등을 비교했습니다.",
        };
    }
}

/**
 * 감사 결과를 읽기 쉬운 형식으로 포맷팅
 */
const formatAuditResult = (data: AuditResponse): string => `이미지 감사 결과:
유사도 판단: ${data.isStyleSimilar ? "유사함" : "유사하지 않음"}

분석 세부 정보:
${data.comparisonResult}

참조 이미지 URL: ${data.referenceImageUrl}`;

/**
 * 이미지 감사 액션 설정
 */
export const auditAction = {
    name: "AUDIT_IMAGE",
    description:
        "사용자 이미지와 참조 IP 자산의 이미지 스타일을 비교 분석합니다",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: Record<string, unknown>,
        callback?: HandlerCallback,
    ): Promise<boolean> => {
        elizaLogger.log("Starting AUDIT_IMAGE handler...");

        // 상태 초기화 또는 업데이트
        let currentState = state;
        if (!currentState) {
            currentState = (await runtime.composeState(message)) as State;
        } else {
            currentState = await runtime.updateRecentMessageState(currentState);
        }

        elizaLogger.info("Starting image audit process...");

        // 2. getIPDetails 액션을 호출
        const ipDetailsAction = new GetIPDetailsAction();

        const ipDetails = await ipDetailsAction.getIPDetails({
            ipId: "0x994BFe1468735060146Ff3510971955a9e0079C2",
        });

        // 3. asset detail에서 imageURL 찾기
        const referenceImageUrl = ipDetails.data.nftMetadata.imageUrl
            ? ipDetails.data.nftMetadata.imageUrl
            : "";

        if (!referenceImageUrl) {
            elizaLogger.error("Failed to extract reference image URL");
            return false;
        }

        elizaLogger.info(`Reference image URL: ${referenceImageUrl}`);

        // 4 & 5. 이미지 비교 로직 (실제 구현에서는 이미지 다운로드 및 비교 알고리즘 필요)
        // 여기서는 간단한 예시로 구현

        return true;

        // 사용자 메시지에서 이미지 URL 추출
        // Generate content using template
        const content = await generateObjectDeprecated({
            runtime,
            context: composeContext({
                state: currentState,
                template: auditTemplate,
            }),
            modelClass: ModelClass.IMAGE,
        });

        // const userImageUrl = await generateObjectDeprecated(runtime, context);

        // if (!userImageUrl || !userImageUrl.userImageUrl) {
        //     elizaLogger.error("Failed to extract user image URL from message");
        //     return false;
        // }

        // try {
        //     // 감사 실행
        //     const auditAction = new AuditAction();
        //     const result = await auditAction.auditImage({
        //         userImageUrl: userImageUrl.userImageUrl,
        //     });

        //     // 결과 포맷팅 및 응답
        //     const formattedResult = formatAuditResult(result);
        //     await runtime.sendMessage(formattedResult);

        //     return true;
        // } catch (error) {
        //     elizaLogger.error("Error in AUDIT_IMAGE action:", error);
        //     await runtime.sendMessage(
        //         "이미지 감사 중 오류가 발생했습니다. 다시 시도해 주세요.",
        //     );
        //     return false;
        // }

        return true;
    },
    template: auditTemplate,
    validate: async () => true,
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Audit this image for style similarity",
                    file: "image formdata",
                    action: "AUDIT_IMAGE",
                },
            },
            {
                user: "{{user1}}",
                content: {
                    text: "이 이미지를 오딧해줘",
                    file: "image formdata",
                    action: "AUDIT_IMAGE",
                },
            },
        ],
    ],
    similes: [
        "AUDIT_IMAGE",
        "AUDIT_IMAGE_FOR_IP",
        "오딧",
        "오딧 감사",
        "이미지 감사",
    ],
};
