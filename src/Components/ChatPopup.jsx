import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const ChatPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const chatBodyRef = useRef(null);
  const api_url = import.meta.env.VITE_API_URL;

  // Toggle chat window
  const toggleChat = () => setIsOpen(!isOpen);

  // Auto scroll when messages update
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  const clearFile = () => setFile(null);

  // 📋 Copy content
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("✅ Đã sao chép nội dung vào clipboard!");
  };

  // 📝 Xuất báo cáo dưới dạng Markdown
  const downloadAsMarkdown = (content) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ESG_Report.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // API: tạo session
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

  // API: gửi tin nhắn text
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

  // API: upload file
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

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    const userMsg = { role: "user", content: input || "(đã gửi tệp)" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Thêm message bot “đang suy nghĩ...”
    const thinkingMsg = {
      role: "bot",
      content: "🤖 Đang suy nghĩ...",
      isThinking: true,
    };
    setMessages((prev) => [...prev, thinkingMsg]);

    const titleSession = input.slice(0, 30);

    try {
      // 🔹 Lấy hoặc tạo session mới
      let sessionId = localStorage.getItem("chat_session_id");
      if (!sessionId) {
        const resSession = await createSession(titleSession);
        if (!resSession.ok) throw new Error("❌ Lỗi tạo session");
        const sessionData = await resSession.json();
        sessionId = sessionData._id;
        localStorage.setItem("chat_session_id", sessionId);
      }

      // 🔹 Gửi message hoặc upload file
      const resMsg = file
        ? await uploadFile(sessionId)
        : await sendTextMessage(sessionId);

      if (resMsg.status !== 201) throw new Error("❌ Lỗi gửi message");

      const text = await resMsg.text();
      let msgData;
      try {
        msgData = JSON.parse(text);
      } catch (e) {
        msgData = { content: text };
      }

      console.log("📄 Full response length:", text.length);

      // Cập nhật nội dung AI trả về
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
      {/* Nút bật chat */}
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
            <span>🤖 Amigo Bot</span>
            <button
              onClick={toggleChat}
              className="hover:text-gray-200 text-lg font-bold"
            >
              ✖
            </button>
          </div>

          {/* Nội dung chat */}
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
                {/* ✅ Bong bóng chat + icon bên phải */}
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div
                    className={`px-3 py-2 rounded-lg text-sm break-words flex-1 ${
                      msg.role === "user"
                        ? "bg-green-100 text-gray-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Icon bên phải */}
                  {msg.role === "bot" && !msg.isThinking && (
                    <div className="flex flex-col gap-1 mt-1">
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="text-xs bg-white border border-gray-300 rounded-md p-1 hover:bg-gray-100"
                        title="Sao chép nội dung"
                      >
                        📋
                      </button>

                      {file != null ? (
                        <button
                          onClick={() => downloadAsMarkdown(msg.content)}
                          className="text-xs bg-white border border-gray-300 rounded-md p-1 hover:bg-gray-100"
                          title="Tải file .md"
                        >
                          📝
                        </button>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Thanh nhập liệu */}
          <div className="flex flex-col border-t border-gray-300">
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
                ref={fileInputRef}
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

            {/* Ô nhập */}
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
