import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";

/**
 * Hook dùng chung để lắng nghe bất kỳ sự kiện Socket.IO nào.
 * Tự động đăng ký, hủy đăng ký khi unmount và chống stale closure.
 *
 * @param event Tên sự kiện (ví dụ: 'new-notification', 'receive-chat-message')
 * @param handler Callback xử lý khi nhận data từ sự kiện
 */
export const useSocketEvent = <T = any>(
  event: string,
  handler: (data: T) => void,
) => {
  const socket = useSocket();
  const handlerRef = useRef(handler);

  // Cập nhật ref mỗi khi handler thay đổi (tránh lỗi stale closure)
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!socket) return;

    const eventListener = (data: T) => {
      handlerRef.current(data);
    };

    socket.on(event, eventListener);

    return () => {
      socket.off(event, eventListener);
    };
  }, [socket, event]);
};

export default useSocketEvent;
