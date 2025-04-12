import { Plugin } from "@elizaos/core";
import documentParse from "./actions/documentParse";

export const Upstage: Plugin = {
    name: "upstage",
    description: "Upstage document process provider plugin.",
    actions: [
        documentParse
    ],
    evaluators: [
        // evaluator here
    ],
    providers: [
        // providers here
    ],
};
