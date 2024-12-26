import { useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  const [file, setFile] = useState(null);

  const [content, setContent] = useState("");

  const [response, setResponse] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const describeImage = async () => {
    if (!file) {
      return;
    }

    if (!content) {
      return;
    }

    setResponse("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("content", content);

    const response = await fetch(`${import.meta.env.API_BASE_URL}/describe-image`, {
      method: "POST",
      body: formData,
    });

    const reader = await response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    const processChunk = async () => {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }

      const data = decoder.decode(value, { stream: true });

      setResponse((prev) => prev + data);

      await processChunk();
    };

    await processChunk();
  };

  const resetPhotoForm = () => {
    setFile(null);
    setContent("");
    setResponse("");
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="flex justify-center my-4">
          {file && (
            <img className="rounded" src={URL.createObjectURL(file)} alt="preview" width="600" />
          )}
        </div>
        {!file && (
          <label
            htmlFor="image-upload"
            className="inline-block bg-slate-500 hover:bg-slate-700 text-white rounded color-white p-2 mb-4"
          >
            Upload Image
          </label>
        )}
        <input
          id="image-upload"
          type="file"
          onChange={handleFileChange}
          hidden
        />
        <textarea
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4"
          value={content}
          placeholder="Ask me anything about the image"
          onChange={(e) => setContent(e.target.value)}
          
        />
        <ReactMarkdown className="my-3">{response}</ReactMarkdown>
        <div className="flex gap-3">
          <button
            className="bg-slate-500 hover:bg-slate-700 text-white rounded color-white p-2
          "
            onClick={describeImage}
          >
            Describe Image
          </button>

          {
            file && <button
              className="bg-slate-500 hover:bg-slate-700 text-white rounded color-white p-2"
              onClick={resetPhotoForm}
            >Reset</button> 
          }
        </div>
      </div>
    </>
  );
}

export default App;
