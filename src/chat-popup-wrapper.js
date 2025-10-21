import React from "react";
import ReactDOM from "react-dom/client";
import ChatPopup from "./Components/ChatPopup.jsx";
import reactToWebComponent from "react-to-webcomponent";
import "./index.css"; 

// 👇 Đóng gói ChatPopup thành Web Component <chat-popup>
const ChatPopupElement = reactToWebComponent(ChatPopup, React, ReactDOM);
customElements.define("chat-popup", ChatPopupElement);
