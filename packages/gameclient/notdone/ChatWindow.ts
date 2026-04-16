export class ChatWindow {
    pushMessage(message: ChatMessage) {

    };
};

type ChatMessage =
    | ServerChatMessage
    | InfoChatMessage
    | PlayerChatMessage;

type ChatMessageType =
    | "server"
    | "player"
    | "info"

interface ChatMessageBase {
    type: ChatMessageType;
    content: string;
    timestamp: number;
};

interface PlayerChatMessage extends ChatMessageBase {
    type: "player";
    senderId: number;
    senderName: string;
    fromClient: boolean;
    isWhisper: boolean;
};

interface ServerChatMessage extends ChatMessageBase {
    type: "server";
};

interface InfoChatMessage extends ChatMessageBase {
    type: "info";
};