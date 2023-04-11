import React, { useState, useEffect} from "react";
import Link from 'next/link'
import AxiosHelper from "../utils/helper/axios.helper";
import { useRouter } from "next/router"

export default function AssetCategoryMobile(props) {
    const { categoryList } = props;
    const [activeCategory, setActiveCategory] = useState("All")
    const categoryIsActive = (category) => {
        setActiveCategory(category.title)
        props.onCategoryChanged(category.category)
    }
    return (
        <div className="channelCatagoryDropDown nav-item dropdown" >
            <a
                className="nav-link dropdown-toggle fs-md"
                id="currentTimeLink"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {activeCategory}
            </a>
            <ul
                className="dropdown-menu p-2 border-0 shadow-sm fs-md time-dropdown timePicker"
                aria-labelledby="currentTimeLink"
            >
                {categoryList?.length && categoryList.map((item, index) => (
                    <li key={index}>
                        <a
                            className="dropdown-item"

                            onClick={() => categoryIsActive(item)}
                        >
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name={item.title}
                                    checked={activeCategory === item.title}
                                    onChange={() => categoryIsActive({ title: item.title, category: item.category })}
                                />
                                <label
                                    className="form-check-label cursor-pointer"

                                >
                                    {item.title}
                                </label>
                            </div>
                        </a>
                    </li>

                ))}
            </ul>
        </div>
    )
}
