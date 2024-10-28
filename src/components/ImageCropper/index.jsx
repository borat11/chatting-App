import React from "react";
import { CrossIcon } from "../../svg/Cross";
import { Cropper } from "react-cropper";

const ImageCropper = ({ image, setImage, cropperRef,getCropData }) => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center">
        <div className="w-[30%] bg-white p-4 rounded-md">
          <div className="relative">
            <h1 className="font-serif text-base text-center">Upload image</h1>
            <div
              onClick={() => setImage()}
              className="absolute top-0 right-2 text-black cursor-pointer hover:text-red-600"
            >
              <CrossIcon />
            </div>
          </div>
          <div className="w-48 h-48 rounded-full mx-auto overflow-hidden">
            <div
              className="img-preview"
              style={{ width: "100%", float: "left", height: "300px" }}
            />
          </div>
          <div className="mt-5">
            <Cropper
              ref={cropperRef}
              style={{ height: 400, width: "100%" }}
              zoomTo={0.5}
              initialAspectRatio={1}
              preview=".img-preview"
              src={image}
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
              guides={true}
            />
          </div>
          <button
            onClick={getCropData}
            className="bg-[#6CD0FB] text-white text-2xl font-bold w-full py-3 mt-3 rounded-md"
          >
            Upload
          </button>
        </div>
      </div>
    </>
  );
};

export default ImageCropper;
