import React, { useState,useEffect } from "react";
import Link from 'next/link'
import AxiosHelper from "../utils/helper/axios.helper";
import { useRouter } from "next/router"

export default function AssetCategory(props) {
  const { categoryList } = props;
  const [activeTag, setActiveTag] = useState("All");

    const toggleIsActive = (obj) => {
      //sessionStorage.setItem('selectedCategory', JSON.stringify({title: obj.title}))
      setActiveTag(obj.title);
      props.onCategoryChanged(obj.category)
    };

  return (    
  <div className="channel-wrapper p-0 d-md-block d-none">
        <div className="scrollmenu border-end py-3 fw-bold" id="channel-types">
          {categoryList?.length && categoryList.map((item,index) => ( 
              <a key={index} className={`d-inline nav-link rounded-pill ${activeTag === item.title ? 'active' : ''} fs-md`}  
              onClick={() =>{ toggleIsActive({title: item.title, category: item.category}) }} id={item.title}>{item.title}</a>
            ))}
        </div>
    </div>
  );
}