import React, { useEffect, useState } from "react";

export default function FileUploadComponent({ handleSubmission }) {
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  };

  useEffect(() => {
    console.log(selectedFile);
  }, [selectedFile]);

  return (
    <div>
      <input type="file" name="file" onChange={changeHandler} />
      {isSelected ? (
        <div>
          <p>Filename: {selectedFile.name}</p>
        </div>
      ) : (
        <p>Select a file to show details</p>
      )}
      <div>
        <button onClick={() => handleSubmission(selectedFile)}>Submit</button>
      </div>
    </div>
  );
}
