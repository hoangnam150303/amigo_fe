import ReactDOM from "react-dom/client";
import ChatPopup from "./Components/ChatPopup";
import "./index.css"; // load TailwindCSS vào bundle
// ✅ Định nghĩa custom HTML tag <chat-popup>
class ChatWidgetElement extends HTMLElement {
  connectedCallback() {
    const container = document.createElement("div");
    this.appendChild(container);

    // ✅ Mount React component vào container
    const root = ReactDOM.createRoot(container);
    root.render(<ChatPopup />);
  }
}

// ✅ Đăng ký tag để có thể dùng ngoài HTML
if (!customElements.get("chat-popup")) {
  customElements.define("chat-popup", ChatWidgetElement);
}
