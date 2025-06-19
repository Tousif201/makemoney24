"use client";
import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function PortableTextEditor({
  value = "",
  onChange,
  className = "",
  expandable = true,
}) {
  const [html, setHtml]   = useState(value);
  const [open, setOpen]   = useState(!expandable);

  const handleChange = (val) => {
    setHtml(val);
    onChange?.(val);
  };

  return (
    <div className={` ${className}`}>
      {expandable && (
        <button
          className="mb-2 bg-blue-500 text-white py-1 px-3 rounded"
          onClick={() => setOpen(!open)}
        >
          {open ? "Collapse Editor" : "Expand Editor"}
        </button>
      )}

      {open && (
        <ReactQuill
          value={html}
          onChange={handleChange}
          theme="snow"
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ],
          }}
          formats={[
            "header",
            "bold",
            "italic",
            "underline",
            "list",
            "bullet",
            "link",
            "image",
          ]}
        />
      )}
    </div>
  );
}
