import React, { useState, useEffect } from 'react';

function FileList({ token, fileUploaded, onFileDeleted }) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/files/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFiles(data);
        }
      } catch (error) {
        console.error("Failed to fetch files:", error);
      }
      setIsLoading(false);
    };

    fetchFiles();
  }, [token, fileUploaded]);

  const handleDelete = async (fileId, filename) => {
    if (!window.confirm(`Are you sure you want to delete '${filename}'? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        onFileDeleted();
      } else {
        alert('Failed to delete file.');
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert('An error occurred while deleting the file.');
    }
  };

  if (isLoading) {
    return <p>Loading files...</p>;
  }

  return (
    <div className="file-list-section">
      <h3>Your Uploaded Documents</h3>
      {files.length > 0 ? (
        <ul>
          {files.map(file => (
            <li key={file.id}>
              <span>{file.filename}</span>
              <button
                className="delete-button"
                onClick={() => handleDelete(file.id, file.filename)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't uploaded any documents yet.</p>
      )}
    </div>
  );
}

export default FileList;