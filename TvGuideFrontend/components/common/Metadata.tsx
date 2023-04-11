import { NextSeo } from "next-seo";
import { useMemo } from "react";
import { useRouter } from 'next/router'

const Metadata = ({data}) =>{
 const { asPath } = useRouter();

 const metadata = useMemo(()=>{
  return {
   title: data.title ? `Tv Guide: ${data.title}` :  "Tv Guide",
   description: data.description || "Tv Guide",
   canonical: data.canonical || asPath,
   url: data.url || asPath,
   keywords: data.keywords || "",
   image: data.image || ""
  }
 }, [data])

return (
 <NextSeo
  title= {metadata.title}
  description= {metadata.description}
  canonical = {metadata.canonical}
  openGraph={{
   type: 'website',
   url: metadata.url,
   title: metadata.title,
   description: metadata.description,
   images: [{
    url: metadata.image,
    alt: metadata.title,
  }],
 }}
 additionalMetaTags={[{
  name: "keywords",
  content: metadata.keywords
 }]}

 />
)
}

export default Metadata;