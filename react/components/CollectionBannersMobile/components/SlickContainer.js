import React, { useState } from "react";
import Slider from "react-slick";
import { classGenerator } from "../../../utils/classGenerator";
import "./react-slick.global.css";

function SlickContainer({ children, isMobile }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const settings = {
    dots: true,
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
    beforeChange: (current, next) => setActiveIndex(next),
    appendDots: dots => (
      <div className={classGenerator("vtex-collection-banners", "slick-dots-wrapper")}>
        <ul className={classGenerator("vtex-collection-banners", "custom-dots-list")}>
          {dots}
        </ul>
      </div>
    ),
    customPaging: index => {
      const isActive = index === activeIndex;
      const dotClass =`${classGenerator("vtex-collection-banners",`custom-dot-item`)} ${isActive ? classGenerator("vtex-collection-banners",`custom-dot-item--active`) : ""}`;

      return <div className={dotClass}></div>;
    },
  };


  return (
    <div className={classGenerator("vtex-collection-banners", "slick-wrapper")}>
      <Slider
        className={classGenerator("vtex-collection-banners", "slick-container")}
        {...settings}
      >
        {children}
      </Slider>
    </div>
  );
}

export default SlickContainer;
