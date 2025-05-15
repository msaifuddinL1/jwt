import { useState, useRef, useEffect } from "react";
import * as jose from "jose";
import TimeChip from "./TimeChips";

export default function TokenInputDisplay() {
  type statusMessageType = {
    message: string;
    error: boolean;
  };

  const [statusMessage, setStatusMessage] = useState<statusMessageType>({
    message: "JWT must not be empty.",
    error: true,
  });

  const [inputValue, setInputValue] = useState<string>("");

  const [headerData, setHeaderData] =
    useState<jose.ProtectedHeaderParameters | null>(null);
  const [payloadData, setPayloadData] = useState<jose.JWTPayload | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to validate JWT token
  const validateJWT = async (token: string) => {
    if (!token.trim()) {
      setStatusMessage({
        message: "JWT must not be empty",
        error: true,
      });
      setHeaderData(null);
      setPayloadData(null);
      return;
    }

    try {
      // Decode the JWT to extract header and payload
      const claims: jose.JWTPayload = jose.decodeJwt(token);
      const headers = jose.decodeProtectedHeader(token);

      // Update state with decoded data
      setHeaderData(headers);
      setPayloadData(claims);

      setStatusMessage({
        message: "JWT token valid",
        error: false,
      });
    } catch (err) {
      console.error("Error: ", err);
      setStatusMessage({
        message: "Incorrect JWT token",
        error: true,
      });
      setHeaderData(null);
      setPayloadData(null);
    }
  };

  // Validate JWT when input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue) {
        validateJWT(inputValue);
      }
    }, 300); // Debounce validation to avoid excessive processing

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  // Function to copy textarea content to clipboard
  const handleCopy = async () => {
    if (!inputValue.trim()) {
      setStatusMessage({
        message: "Nothing to copy - textarea is empty",
        error: true,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(inputValue);
      setStatusMessage({
        message: "Copied to clipboard successfully",
        error: false,
      });
    } catch (err) {
      console.error("Error: ", err);
      setStatusMessage({
        message: "Failed to copy text to clipboard",
        error: true,
      });
    }
  };

  // Function to paste clipboard content to textarea
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setInputValue(clipboardText);

      if (clipboardText) {
        validateJWT(clipboardText);
      } else {
        setStatusMessage({
          message: "Clipboard is empty",
          error: true,
        });
      }
    } catch (err) {
      console.error("Error: ", err);
      setStatusMessage({
        message:
          "Failed to read from clipboard. Make sure you've granted permission.",
        error: true,
      });
    }
  };

  // Function to clear the textarea
  const handleClear = () => {
    setInputValue("");
    setHeaderData(null);
    setPayloadData(null);
    setStatusMessage({
      message: "Textarea cleared",
      error: false,
    });
    // Focus the textarea after clearing
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle textarea input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  // Function to copy header or payload data
  const handleCopyData = async (data: any) => {
    if (!data) {
      setStatusMessage({
        message: "No data to copy",
        error: true,
      });
      return;
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setStatusMessage({
        message: "Data copied to clipboard successfully",
        error: false,
      });
    } catch (err) {
      console.error("Error: ", err);
      setStatusMessage({
        message: "Failed to copy data to clipboard",
        error: true,
      });
    }
  };

  // Render colored token segments for the pre element
  const renderColoredToken = (value: string) => {
    const segments = value.split(".");
    if (segments.length < 3) {
      return value;
    }

    return (
      <>
        <span className="text-blue">{segments[0]}</span>
        <span className="text-text">.</span>
        <span className="text-text">{segments[1]}</span>
        <span className="text-text">.</span>
        <span className="text-mauve">{segments[2]}</span>
      </>
    );
  };

  return (
    <div className="container grid h-fit max-h-2/3 grid-cols-2 gap-8 py-5">
      <div className="bg-crust flex flex-col gap-4 rounded-2xl p-4" id="input">
        <div className="flex space-x-2 self-end">
          <button
            className="border-surface0 hover:bg-mantle cursor-pointer rounded border px-2 py-1"
            onClick={handlePaste}
          >
            PASTE
          </button>
          <button
            className="border-surface0 hover:bg-mantle cursor-pointer rounded border px-2 py-1"
            onClick={handleCopy}
          >
            COPY
          </button>
          <button
            className="border-surface0 hover:bg-mantle cursor-pointer rounded border px-2 py-1"
            onClick={handleClear}
          >
            CLEAR
          </button>
        </div>
        <div id="statusMessage">
          {statusMessage.message && (
            <p className={`${statusMessage.error ? "text-red" : "text-green"}`}>
              {statusMessage.message}
            </p>
          )}
        </div>

        <div className="border-surface0 relative h-full rounded border font-mono text-sm">
          {/* Colored pre element (visible but non-interactive) */}
          <pre
            aria-hidden="true"
            className="pointer-events-none m-0 h-full w-full overflow-auto bg-none p-2 break-all whitespace-pre-wrap"
          >
            {inputValue ? (
              renderColoredToken(inputValue)
            ) : (
              <span className="text-surface2">Enter JWT token here</span>
            )}
          </pre>

          {/* Actual textarea (transparent text but functional) */}
          <textarea
            name="jwt-input"
            id="jwt-input"
            className="absolute inset-0 h-full w-full resize-none overflow-hidden p-2 text-transparent caret-lavender"
            value={inputValue}
            onChange={handleInputChange}
            ref={textareaRef}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          ></textarea>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div
          id="headerDisplay"
          className="bg-surface0 flex h-46 flex-col gap-4 rounded-2xl p-4"
        >
          <button
            className="border-surface2 hover:bg-surface1 w-fit cursor-pointer self-end rounded border-2 px-2 py-1"
            onClick={() => handleCopyData(headerData)}
          >
            COPY
          </button>
          <div className="overflow-y-auto">
            {headerData ? (
              <pre className="text-sm">
                {JSON.stringify(headerData, null, 2)}
              </pre>
            ) : (
              <p className="text-surface2">No header data available</p>
            )}
          </div>
        </div>
        <div
          id="payloadDisplay"
          className="bg-surface0 flex h-96 flex-col gap-4 rounded-2xl p-4"
        >
          <button
            className="border-surface2 hover:bg-surface1 w-fit cursor-pointer self-end rounded border-2 px-2 py-1"
            onClick={() => handleCopyData(payloadData)}
          >
            COPY
          </button>
          <div className="overflow-y-auto">
            {payloadData ? (
              <pre className="text-sm">
                {JSON.stringify(payloadData, null, 2)}
              </pre>
            ) : (
              <p className="text-surface2">No payload data available</p>
            )}
          </div>
          <div className="flex flex-row space-x-2">
            {payloadData?.exp &&
              <TimeChip number={payloadData.exp} title="Expiry: "/>
            }
            {payloadData?.iat &&
              <TimeChip number={payloadData.iat} title="Issued: "/>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
