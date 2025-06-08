import { useState, useCallback } from "react";

export default function useChatBot() {
  const [visible, setVisible] = useState(false);

  const toggleChatBot = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  const openChatBot = useCallback(() => setVisible(true), []);
  const closeChatBot = useCallback(() => setVisible(false), []);

  return {
    visible,
    toggleChatBot,
    openChatBot,
    closeChatBot,
  };
}
