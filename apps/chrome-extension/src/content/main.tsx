import { GmailTracker } from "./lib/gmail-tracker";

console.log("[CRXJS] Hello world from content script!");

// const container = document.createElement("div");
// container.id = "crxjs-app";
// // Make it visible on Gmail
// container.style.position = "fixed";
// container.style.top = "20px";
// container.style.right = "20px";
// container.style.zIndex = "10000";
// container.style.background = "white";
// container.style.border = "2px solid #4285f4";
// container.style.borderRadius = "8px";
// container.style.padding = "16px";
// container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
// container.style.maxWidth = "300px";
// document.body.appendChild(container);

// createRoot(container).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );

const gmailTracker = new GmailTracker();

gmailTracker.init();
