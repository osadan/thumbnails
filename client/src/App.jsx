import React, { useState } from 'react';
import { Router, ReactLocation } from 'react-location'
import styled from 'styled-components'
const location = new ReactLocation();

const path = 'https://thumbnail-6wvmdlo5cq-uc.a.run.app';
const localPath = 'http://localhost:3001'


function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(300);
  const [imageWidth, setImageWidth] = useState(undefined);
  const [imageHeight, setImageHeight] = useState(undefined);
  const [keepProportions, setKeepProportions] = useState(false)

  const imageProportion = imageWidth && imageHeight && imageWidth / imageHeight;
  const selectedSizesProportion = width && height && width / height;

  const changeHandler = (event) => {
    const file = event.target.files[0];
    const img = document.getElementById("preview");
    if (file.type.startsWith('image/')) {
      img.file = file;
      setKeepProportions(true);
      const reader = new FileReader();
      reader.onload = (function (aImg) {
        return function (e) {
          aImg.src = e.target.result;
          setImageSizes();
        };
      }
      )(img);
      reader.readAsDataURL(file);
    } else {
      img.src = null;
      setKeepProportions(false);
      setImageWidth(undefined);
      setImageHeight(undefined);
    }
    console.log(event.target.files[0])

    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  };

  const getFormData = () => {
    const formData = new FormData();

    formData.append('File', selectedFile);
    formData.append('width', width)
    formData.append('height', height)
    return formData;
  }

  const setImageSizes = () => {
    requestAnimationFrame(() => {
      const aImg = document.getElementById("preview");
      setImageWidth(aImg.naturalWidth)
      setImageHeight(aImg.naturalHeight)
    })
  }

  const handleSubmission = () => {
    fetch(
      `${localPath}/upload`,
      {
        method: 'POST',
        body: getFormData(),
        sizes: {
          width,
          height
        }
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
    fetch(
      `${localPath}/generate`,
      {
        method: 'POST',
        body: getFormData(),
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

  const handleGenerateStream = () => {
    fetch(
      `${localPath}/generate-stream`,
      {
        method: 'POST',
        body: getFormData(),
      }
    )
      .then((response) => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const img = document.getElementById("preview");
        img.src = url;
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
          {imageWidth && <p>Image Width: {imageWidth}</p>}
          {imageHeight && <p>Image Height: {imageHeight}</p>}
          {imageProportion && <p>Image proportion: {imageProportion}</p>}
          <p>
            lastModifiedDate:{' '}
            {selectedFile.lastModifiedDate.toLocaleDateString()}
          </p>


        </div>
      ) : (
        <p>Select a file to show details</p>
      )}
      <ImgPreview id='preview' ></ImgPreview>
      <br />
      <input type="checkbox" checked={keepProportions} onChange={(e) => setKeepProportions(e.target.checked)} />
      <label>keep Proportions</label>
      <br />
      <label>Width:</label> <br /><input type="text" value={width} onChange={(e) => {
        setWidth(e.target.value)
        if (keepProportions && imageProportion) {
          setHeight(e.target.value / imageProportion)
        }

      }} />
      <br />
      <label>Height:</label> <br /><input type="text" value={height} onChange={(e) => {
        setHeight(e.target.value)
        if (keepProportions && imageProportion) {
          setWidth(e.target.value * imageProportion)
        }
      }}
      />
      <br />
      <br />
      <p>selected sizes proportion: {selectedSizesProportion} </p>



      <div>
        <button onClick={handleSubmission}>Upload</button>
        <button onClick={handleGenerate}>Generate</button>
        <button onClick={handleGenerateStream}>Stream</button>
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