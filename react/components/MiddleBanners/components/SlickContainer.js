import React from "react";
import Slider from "react-slick";
import { classGenerator } from "../../../utils/classGenerator";
import "./react-slick.global.css";

function SlickContainer({ children, isMobile }) {
  const settings = {
    dots: false,
    infinite: false,
    speed: 600,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "15px",
    autoplay: false,
    autoplaySpeed: 4000,
    pauseOnHover: false,
  };


  return (
    <div className={classGenerator("vtex-middle-banners", "slick-wrapper")}>
      <Slider
        className={classGenerator("vtex-middle-banners", "slick-container")}
        {...settings}
      >
        {children}
      </Slider>
    </div>
  );
}

export default SlickContainer;
