import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const chatBodyRef = useRef(null);
  const api_url = import.meta.env.VITE_API_URL;

  // Toggle open/close chat window
  const toggleChat = () => setIsOpen(!isOpen);

  // Auto scroll when messages update
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle file change
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const clearFile = () => setFile(null);

  // API helpers
  const createSession = async (titleSession) => {
    const res = await fetch(`${api_url}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "demo-user",
        title: titleSession,
      }),
    });
    return res;
  };

  const sendTextMessage = async (sessionId) => {
    const resMsg = await fetch(`${api_url}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        role: "user",
        content: input,
      }),
    });
    return resMsg;
  };

  const uploadFile = async (sessionId) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("uploaded_by", "demo-user");
    formData.append("file", file);

    await fetch(`${api_url}/attachments/upload`, {
      method: "POST",
      body: formData,
    });
    return await sendTextMessage(sessionId);
  };

  // Send message logic
  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    // Add user's message to chat
    const userMsg = { role: "user", content: input || "(đã gửi tệp)" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setFile(null);

    // Add "thinking" placeholder
    const thinkingMsg = {
      role: "bot",
      content: "🤖 Đang suy nghĩ...",
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMsg]);

    const titleSession = input.slice(0, 30);

    try {
      // Get or create session
      let sessionId = localStorage.getItem("chat_session_id");
      if (!sessionId) {
        const resSession = await createSession(titleSession);
        if (!resSession.ok) throw new Error("❌ Lỗi tạo session");
        const sessionData = await resSession.json();
        sessionId = sessionData._id;
        localStorage.setItem("chat_session_id", sessionId);
      }

      // Send message or upload file
      const resMsg = file
        ? await uploadFile(sessionId)
        : await sendTextMessage(sessionId);

      if (resMsg.status !== 201) throw new Error("❌ Lỗi gửi message");

      const msgData = await resMsg.json();

      // Replace "thinking" message with bot reply
      setMessages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((m) => m.isThinking);
        if (idx !== -1)
          updated[idx] = {
            role: "bot",
            content: msgData?.content || "🤖 Bot không phản hồi.",
          };
        return updated;
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((m) => m.isThinking);
        if (idx !== -1)
          updated[idx] = {
            role: "bot",
            content: "⚠️ Có lỗi xảy ra khi gửi tin nhắn!",
          };
        return updated;
      });
    }
  };

  return (
    <>
      {/* Nút tròn bật chat */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white text-2xl rounded-full w-14 h-14 shadow-lg flex items-center justify-center z-50 transition-transform duration-200 hover:scale-110"
      >
        💬
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[460px] bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden border border-gray-200 z-50 animate-fadeIn">
          {/* Header */}
          <div className="bg-green-500 text-white p-3 flex justify-between items-center font-semibold">
            <span>🤖 Chat với Bot</span>
            <button
              onClick={toggleChat}
              className="hover:text-gray-200 text-lg font-bold"
            >
              ✖
            </button>
          </div>

          {/* Nội dung tin nhắn */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[75%] break-words ${
                    msg.role === "user"
                      ? "bg-green-100 text-gray-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {msg.fileUrl && (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-1 text-blue-600 underline text-xs"
                    >
                      📎 {msg.fileName}
                    </a>
                  )}

                  {/* ✅ Markdown hiển thị đúng cách */}
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Hiển thị ảnh đính kèm */}
                  {msg.fileUrl &&
                    msg.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) && (
                      <img
                        src={msg.fileUrl}
                        alt="preview"
                        className="mt-2 rounded-md max-h-32 border"
                      />
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Thanh nhập & chọn file */}
          <div className="flex flex-col border-t border-gray-300">
            {/* Chọn file */}
            <div className="flex items-center p-2 gap-2 bg-gray-100 border-b border-gray-200">
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm font-medium flex items-center"
              >
                📎 Chọn tệp
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              {file && (
                <div className="flex items-center gap-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-md px-2 py-1">
                  <span className="truncate max-w-[130px]">{file.name}</span>
                  <button
                    onClick={clearFile}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>

            {/* Nhập nội dung */}
            <div className="flex">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 p-2 text-sm outline-none text-black"
              />
              <button
                onClick={sendMessage}
                className="bg-green-500 text-white px-4 hover:bg-green-600"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPopup;
