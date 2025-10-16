import React from "react";
import ChatPopup from "./Components/ChatPopup";


export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-3">🌱 ESG IoT Dashboard</h1>
      <p className="text-gray-300">Bấm nút 💬 ở góc phải để mở chat popup 🤖</p>

      {/* Chat Popup */}
      <ChatPopup />
    </div>
  );
}
