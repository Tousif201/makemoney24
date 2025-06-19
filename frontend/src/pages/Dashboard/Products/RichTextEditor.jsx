"use client";
import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function PortableTextEditor({
  value = "",
  onChange,
  className = "",
}) {
  const [html, setHtml] = useState(value);

  const handleChange = (val) => {
    setHtml(val);
    onChange?.(val);
  };
  return (
    <div className={` ${className}`}>
      <ReactQuill
        value={html}
        onChange={handleChange}
        theme="snow"
        placeholder="Start typing your content here..."
        modules={{
          toolbar: [
            // Headings
            [{ header: [1, 2, 3, 4, 5, 6, false] }],

            // Font and Font Size (optional, uncomment if needed)
            // [{ font: [] }],
            // [{ size: ["small", false, "large", "huge"] }],

            // Basic Text Formatting
            ["bold", "italic", "underline", "strike"],
            [{ script: "sub" }, { script: "super" }], // Subscript/Superscript

            // Alignment
            [{ align: [] }],

            // Lists
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }], // Outdent/Indent

            // Text Color and Background Color
            [{ color: [] }, { background: [] }],

            // Blockquote and Code Block
            ["blockquote", "code-block"],

            // Link (keeping link as it's a text-based input for URLs)
            ["link"],

            // Clear Formatting
            ["clean"],
          ],
        }}
        formats={[
          "header",
          // "font", // Uncomment if font module is used
          // "size", // Uncomment if size module is used
          "bold",
          "italic",
          "underline",
          "strike",
          "script",
          "align",
          "list",
          "bullet",
          "indent",
          "color",
          "background",
          "blockquote",
          "code-block",
          "link",
        ]}
      />
    </div>
  );
}
