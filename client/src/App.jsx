import React, { useState } from 'react';
import { Router, ReactLocation } from 'react-location'
import styled from 'styled-components'
const location = new ReactLocation();

const path = 'https://thumbnail-6wvmdlo5cq-uc.a.run.app';
const localPath = 'http://localhost:3001'


function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);

  const changeHandler = (event) => {
    const file = event.target.files[0];
    /* if (file.type.startsWith('image/')) {


      const img = document.getElementById("preview");
      img.file = file;

      const reader = new FileReader();
      reader.onload = (function (aImg) { return function (e) { aImg.src = e.target.result; }; })(img);
      reader.readAsDataURL(file);
    } */
    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  };

  const handleSubmission = () => {
    const formData = new FormData();

    formData.append('File', selectedFile);


    fetch(
      `${localPath}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result);
        const img = document.getElementById("preview");
        img.src = result.data.externalPath;
        setIsSelected(true);

      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleGenerate = () => {
    const formData = new FormData();

    formData.append('File', selectedFile);


    fetch(
      `${localPath}/generate`,
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result);
        const img = document.getElementById("preview");
        img.src = result.data.base64;
        setIsSelected(true);

      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }


  return (
    <div>
      <input type="file" name="file" onChange={changeHandler} />
      {isSelected ? (
        <div>
          <p>Filename: {selectedFile.name}</p>
          <p>Filetype: {selectedFile.type}</p>
          <p>Size in bytes: {selectedFile.size}</p>
          <p>
            lastModifiedDate:{' '}
            {selectedFile.lastModifiedDate.toLocaleDateString()}
          </p>


        </div>
      ) : (
        <p>Select a file to show details</p>
      )}
      <ImgPreview id='preview' ></ImgPreview>
      <div>
        <button onClick={handleSubmission}>Upload</button>
        <button onClick={handleGenerate}>Generate</button>
      </div>


    </div>
  )
}


const App = () => (<Router
  location={location}
  routes={[{
    path: '/',
    element: <FileUploadPage />
  }
  ]}
></Router>)


export default App;

const ImgPreview = styled.img`
  margin-top:16px;
  max-height:150px;
  border:1px solid black;
  padding:16px;
`