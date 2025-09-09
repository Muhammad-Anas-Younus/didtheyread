export class GmailTracker {
  private isEnabled = true;
  private trackingDomain = "https://your-tracking-domain.com";
  private observer: MutationObserver | null = null;

  async init() {
    console.log("Gmail Tracker initializing...");

    // Wait for Gmail to load
    await this.waitForGmailLoad();

    // Setup tracking
    this.setupEmailTracking();

    // Listen for messages from popup/background
    this.setupMessageListener();

    console.log("Gmail Tracker initialized successfully");
  }

  private async waitForGmailLoad(): Promise<void> {
    return new Promise((resolve) => {
      const checkGmail = () => {
        const gmailInterface = document.querySelector(".nH");
        const composeArea = document.querySelector(".T-I.T-I-KE.L3");

        if (gmailInterface && composeArea) {
          resolve();
        } else {
          setTimeout(checkGmail, 1000);
        }
      };
      checkGmail();
    });
  }

  private setupEmailTracking() {
    // Method 1: Observe DOM for compose windows
    this.observeComposeWindows();

    // Method 2: Intercept send button clicks globally
    // this.interceptSendActions();
  }

  private observeComposeWindows() {
    console.log("setting up compose window observer");
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            // Look for compose windows
            const composeWindow = element.querySelector(
              `[aria-labelledby=":my"],[role="dialog"]`
            );

            console.log(composeWindow, "cmposecinwo");

            if (
              composeWindow &&
              this.isComposeWindow(composeWindow as HTMLElement)
            ) {
              this.setupComposeWindow(composeWindow as HTMLElement);
            }
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private isComposeWindow(element: HTMLElement): boolean {
    // Check if this is actually a compose window
    const hasSubjectField = element.querySelector('input[name="subjectbox"]');
    const hasToField = element.querySelector('[aria-label="To recipients"]');
    const hasSendButton = element.querySelector(
      '[aria-label="Send ‪(Ctrl-Enter)‬"]'
    );

    return !!(hasSubjectField && hasToField && hasSendButton);
  }

  private setupComposeWindow(composeWindow: HTMLElement) {
    console.log("Setting up compose window for tracking");

    const sendButtons = composeWindow.querySelectorAll(
      '[aria-label="Send ‪(Ctrl-Enter)‬"]'
    );

    console.log(sendButtons, "sendButons");

    sendButtons.forEach((button) => {
      if (!button.hasAttribute("data-tracker-setup")) {
        button.setAttribute("data-tracker-setup", "true");
        button.addEventListener(
          "click",
          (event) => {
            this.handleSendButtonClick(event, composeWindow);
          },
          { capture: true }
        );
      }
    });
  }

  private interceptSendActions() {
    // Global click listener for send buttons
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target as HTMLElement;
        const sendButton = target.closest(
          '[data-tooltip="Send"], [aria-label*="Send"]'
        );

        if (sendButton && !sendButton.hasAttribute("data-tracker-processed")) {
          const composeWindow = sendButton.closest(
            '[role="dialog"]'
          ) as HTMLElement;
          if (composeWindow && this.isComposeWindow(composeWindow)) {
            this.handleSendButtonClick(event, composeWindow);
          }
        }
      },
      { capture: true }
    );
  }

  private handleSendButtonClick(event: Event, composeWindow: HTMLElement) {
    if (!this.isEnabled) return;

    console.log("Intercepting email send...");

    // Prevent the send temporarily
    event.preventDefault();
    event.stopPropagation();

    console.log("The email send was intercepted successfully!!!!");

    try {
      // Extract email data
      const emailData = this.extractEmailData(composeWindow);

      // Inject tracking pixel
      //   this.injectTrackingPixel(composeWindow, emailData);

      // Continue with send after a short delay
      //   setTimeout(() => {
      //     this.continueSend(event.target as HTMLElement);
      //   }, 200);
    } catch (error) {
      console.error("Error in email tracking:", error);
      // Continue with send even if tracking fails
      this.continueSend(event.target as HTMLElement);
    }
  }

  private extractEmailData(composeWindow: HTMLElement) {
    // Extract recipient
    const toFeildTable = composeWindow.querySelectorAll(`tbody`);
    if (toFeildTable) {
      console.log(toFeildTable, "toFieldTable");
    }
    const toField = composeWindow.querySelector('id=":zb"') as HTMLInputElement;
    let recipients = "";

    if (toField) {
      recipients = toField.value || toField.textContent || "";
    } else {
      // Try alternative selectors for recipient
      const toContainer = composeWindow.querySelector(
        '[data-tooltip*="recipients"]'
      );
      if (toContainer) {
        recipients = toContainer.textContent || "";
      }
    }

    // Extract subject
    const subjectField = composeWindow.querySelector(
      '[name="subject"], [aria-label*="Subject"]'
    ) as HTMLInputElement;
    const subject = subjectField?.value || subjectField?.textContent || "";

    // Extract content area for validation
    const contentArea = composeWindow.querySelector(
      '[contenteditable="true"], [role="textbox"]'
    ) as HTMLElement;

    return {
      testing: "working?",
      //   recipients: recipients.trim(),
      //   subject: subject.trim(),
      //   hasContent: (contentArea?.textContent?.trim().length || 0) > 0,
      //   timestamp: Date.now(),
    };
  }

  //   private injectTrackingPixel(composeWindow: HTMLElement, emailData: any) {
  //     const contentArea = composeWindow.querySelector('[contenteditable="true"], [role="textbox"]') as HTMLElement;

  //     if (!contentArea) {
  //       console.warn('Could not find email content area for pixel injection');
  //       return;
  //     }

  //     // Generate tracking ID
  //     const trackingId = this.generateTrackingId();

  //     // Create tracking pixel
  //     const trackingPixel = this.createTrackingPixel(trackingId);

  //     // Inject pixel into email content
  //     contentArea.appendChild(trackingPixel);

  //     // Store tracking data
  //     this.storeTrackingData(trackingId, emailData);

  //     console.log('Tracking pixel injected successfully:', trackingId);
  //   }

  private createTrackingPixel(trackingId: string): HTMLElement {
    const img = document.createElement("img");
    img.src = `${this.trackingDomain}/pixel/${trackingId}.png`;
    img.width = 1;
    img.height = 1;
    img.alt = "";
    img.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      left: -9999px !important;
      top: -9999px !important;
      border: none !important;
      margin: 0 !important;
      padding: 0 !important;
    `;
    img.setAttribute("data-tracking-pixel", trackingId);

    return img;
  }

  private generateTrackingId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `track_${timestamp}_${random}`;
  }

  private continueSend(sendButton: HTMLElement) {
    // Mark as processed to avoid re-interception
    sendButton.setAttribute("data-tracker-processed", "true");

    // Create a new click event to trigger the original send
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    sendButton.dispatchEvent(clickEvent);

    // Clean up the processed flag after a delay
    setTimeout(() => {
      sendButton.removeAttribute("data-tracker-processed");
    }, 1000);
  }

  private setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "TOGGLE_TRACKING") {
        this.isEnabled = message.enabled;
        console.log(
          `Gmail tracking ${this.isEnabled ? "enabled" : "disabled"}`
        );
      }

      sendResponse({ success: true });
    });
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
