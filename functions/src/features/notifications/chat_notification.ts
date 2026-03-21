import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { AppLogger } from "../../core/utils/logger";

/**
 * Send FCM push notification to recipient when a new chat message is created.
 * Trigger: chats/{chatId}/messages/{messageId}
 */
export const onNewChatMessage = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const message = snapshot.data() as {
      senderId: string;
      senderName?: string;
      text: string;
      type?: string;
    };

    // Skip system messages
    if (message.senderId === "system" || message.type === "system") return;

    const chatId = event.params.chatId;

    try {
      // Get chat document to find participants
      const chatDoc = await admin
        .firestore()
        .collection("chats")
        .doc(chatId)
        .get();

      if (!chatDoc.exists) {
        AppLogger.warn("NOTIFICATION", { msg: `Chat ${chatId} not found` });
        return;
      }

      const chatData = chatDoc.data() as {
        participants: string[];
        participantsInfo?: Record<string, { name?: string; photo?: string }>;
        demandTitle?: string;
      };

      const participants: string[] = chatData.participants ?? [];

      // Recipient is the participant that did NOT send the message
      const recipientIds = participants.filter((uid) => uid !== message.senderId);
      if (recipientIds.length === 0) return;

      const senderName =
        message.senderName ??
        chatData.participantsInfo?.[message.senderId]?.name ??
        "Usuário";

      // Send notification to each recipient
      const sendPromises = recipientIds.map(async (recipientId) => {
        // Check users/ first, then professionals/ (pro app users live there)
        let fcmToken: string | undefined;
        const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(recipientId)
          .get();
        if (userDoc.exists) {
          fcmToken = userDoc.data()?.fcmToken as string | undefined;
        }
        if (!fcmToken) {
          const proDoc = await admin
            .firestore()
            .collection("professionals")
            .doc(recipientId)
            .get();
          if (proDoc.exists) {
            fcmToken = proDoc.data()?.fcmToken as string | undefined;
          }
        }

        if (!fcmToken) {
          AppLogger.info("NOTIFICATION", {
            msg: `No FCM token for user ${recipientId}`,
          });
          return;
        }

        const notificationBody = message.text.substring(0, 200);

        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: senderName,
            body: notificationBody,
          },
          data: {
            type: "chat_message",
            chatId,
            otherUserId: message.senderId,
            otherUserName: senderName,
            otherUserPhoto:
              chatData.participantsInfo?.[message.senderId]?.photo ?? "",
          },
          android: {
            priority: "high",
            notification: {
              channelId: "reparador_chat",
              sound: "default",
              clickAction: "FLUTTER_NOTIFICATION_CLICK",
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "default",
                badge: 1,
              },
            },
          },
        });

        // Also persist notification to Firestore for the in-app screen
        await admin
          .firestore()
          .collection("notifications")
          .doc(recipientId)
          .collection("items")
          .add({
            type: "chat_message",
            title: senderName,
            body: notificationBody,
            chatId,
            otherUserId: message.senderId,
            otherUserName: senderName,
            otherUserPhoto:
              chatData.participantsInfo?.[message.senderId]?.photo ?? "",
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        AppLogger.info("NOTIFICATION", {
          msg: `FCM sent to ${recipientId} for chat ${chatId}`,
        });
      });

      await Promise.all(sendPromises);
    } catch (error) {
      AppLogger.error("NOTIFICATION_ERROR", { chatId, error });
    }
  }
);
