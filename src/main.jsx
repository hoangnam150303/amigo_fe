import ReactDOM from "react-dom/client";
import ChatPopup from "./Components/ChatPopup";

// Định nghĩa custom HTML tag <chat-popup>
class ChatWidgetElement extends HTMLElement {
  connectedCallback() {
    const container = document.createElement("div");
    this.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<ChatPopup />);
  }
}

// Đăng ký tag để dùng ở HTML ngoài
customElements.define("chat-popup", ChatWidgetElement);
