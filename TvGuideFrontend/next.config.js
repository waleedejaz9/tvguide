/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
});
require('dotenv').config({ path: `/.env.${process.env.NODE_ENV}` })

//Specifying default time zone
module.exports = withPWA({
  basePath: '/tv-guide',
  images: {
    protocol: "https",
    domains: ["tv.assets.pressassociation.io", "for-images.s3.eu-west-2.amazonaws.com"],
    
  },
  publicRuntimeConfig: {
    siteURL: process.env.SITE_URL,
    apiURL: process.env.NEXT_PUBLIC_API_BASE_URL
  },
});