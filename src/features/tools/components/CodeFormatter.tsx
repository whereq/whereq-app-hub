import { useState, useEffect } from "react";
import { loadPyodide, PyodideInterface } from "pyodide";
import AceEditor from "react-ace";

// Import Ace editor modes and themes from node_modules
import "ace-builds/src-noconflict/mode-python"; // Syntax highlighting for Python
import "ace-builds/src-noconflict/mode-java"; // Syntax highlighting for Java
import "ace-builds/src-noconflict/mode-sh"; // Syntax highlighting for Bash
import "ace-builds/src-noconflict/mode-typescript"; // Syntax highlighting for TypeScript
import "ace-builds/src-noconflict/mode-javascript"; // Syntax highlighting for JavaScript
import "ace-builds/src-noconflict/theme-monokai"; // Theme for syntax highlighting

const CodeFormatter = () => {
  const [originalCode, setOriginalCode] = useState("");
  const [formattedCode, setFormattedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [language, setLanguage] = useState("python");

  useEffect(() => {
    let pyodideInstance: PyodideInterface | null = null;

    const loadPyodideAndBlack = async () => {
      try {
        pyodideInstance = await loadPyodide({
          indexURL: "../../../libs/pyodide/",
        });

        await pyodideInstance.loadPackage("micropip");
        await pyodideInstance.runPythonAsync(`
          import micropip
          await micropip.install('black')
        `);

        setPyodide(pyodideInstance);
      } catch (err) {
        setError("Failed to load Pyodide or black.");
        console.error(err);
      }
    };

    loadPyodideAndBlack();

    return () => {
      if (pyodideInstance) {
        pyodideInstance.runPythonAsync(`
          import sys
          sys.modules.clear()
        `);
        setPyodide(null);
      }
    };
  }, []);

  const handleFormatCode = async () => {
    if (!originalCode.trim()) {
      setError("Please enter some code to format.");
      return;
    }

    if (!pyodide) {
      setError("Pyodide is not loaded yet.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (language === "python") {
        const formattedCode = await pyodide.runPythonAsync(`
          import black
          formatted_code = black.format_str("""${originalCode.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${")}""", mode=black.Mode())
          formatted_code
        `);
        setFormattedCode(formattedCode);
      } else {
        setFormattedCode(originalCode);
      }
    } catch (err) {
      setError("Failed to format the code. Please check the input.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 font-fira-code text-orange-300 p-0 m-0 flex flex-col overflow-hidden">
      {/* Horizontal Bar */}
      <div className="flex-none p-1 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <select
            className="bg-gray-700 text-orange-300 p-1 rounded-md w-32"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="bash">Bash</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
          </select>

          {error && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-md text-sm">
              {error}
            </div>
          )}

          {!pyodide && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-md text-sm">
              Loading Pyodide...
            </div>
          )}
        </div>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-400"
          onClick={handleFormatCode}
          disabled={isLoading || !pyodide}
        >
          {isLoading ? "Formatting..." : "Format Code"}
        </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-2 gap-[1px] flex-grow min-h-0">
        {/* Left Box - Original Code */}
        <div className="h-full bg-gray-800 overflow-hidden flex flex-col">
          <div className="flex-grow relative h-full overflow-hidden">
            {/* Parent div for line numbers and Ace editor */}
            <div className="h-full flex overflow-y-auto">
              {/* Line Numbers */}
              <div className="w-8 bg-gray-700 text-gray-400 text-right pr-2 select-none">
                {originalCode.split("\n").map((_, index) => (
                  <div key={index} style={{ lineHeight: "1.5" }}>
                    {index + 1}
                  </div>
                ))}
              </div>
              {/* Ace Editor */}
              <div className="flex-1">
                <AceEditor
                  mode={language} // Set the language mode
                  theme="monokai" // Set the theme
                  value={originalCode}
                  onChange={(code) => setOriginalCode(code)}
                  placeholder={`Paste your unformatted ${language} code here...`}
                  fontSize={14} // Set font size
                  showGutter={false} // Hide the default gutter (line numbers)
                  width="100%"
                  height="100%"
                  style={{
                    backgroundColor: "#1F2937", // Tailwind's bg-gray-800
                    color: "#FBBF24", // Tailwind's text-orange-300
                  }}
                  setOptions={{
                    showLineNumbers: false, // Hide line numbers
                    useWorker: false, // Disable worker for performance
                    scrollPastEnd: false, // Disable scrolling past the end
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Box - Formatted Code */}
        <div className="h-full bg-gray-800 overflow-hidden flex flex-col">
          <div className="flex-grow relative h-full overflow-hidden">
            {/* Parent div for line numbers and Ace editor */}
            <div className="h-full flex overflow-y-auto">
              {/* Line Numbers */}
              <div className="w-8 bg-gray-700 text-gray-400 text-right pr-2 select-none">
                {formattedCode.split("\n").map((_, index) => (
                  <div key={index} style={{ lineHeight: "1.5" }}>
                    {index + 1}
                  </div>
                ))}
              </div>
              {/* Ace Editor */}
              <div className="flex-1">
                <AceEditor
                  mode={language} // Set the language mode
                  theme="monokai" // Set the theme
                  value={formattedCode}
                  onChange={(code) => setFormattedCode(code)}
                  placeholder={`Formatted ${language} code will appear here...`}
                  fontSize={14} // Set font size
                  showGutter={false} // Hide the default gutter (line numbers)
                  readOnly // Make the editor read-only
                  width="100%"
                  height="100%"
                  style={{
                    backgroundColor: "#1F2937", // Tailwind's bg-gray-800
                    color: "#FBBF24", // Tailwind's text-orange-300
                  }}
                  setOptions={{
                    showLineNumbers: false, // Hide line numbers
                    useWorker: false, // Disable worker for performance
                    scrollPastEnd: false, // Disable scrolling past the end
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeFormatter;