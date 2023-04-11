import AxiosHelper from "./../../utils/helper/axios.helper";

const Sitemap = () =>{
 return null;
}


export const getServerSideProps = async ({res, params}) => {
  const siteURL = process.env.SITE_URL || 'localhost';
  const page = params.page ? params.page.split(".")[0] : 1;
  const LIMIT = 500;
  const apiURL = `/schedule/allList?offset=${(page-1)*LIMIT}&limit=${LIMIT}`;
  const request = new AxiosHelper(apiURL);
  const result = await request.get();
  const total = result?.data?.total || 0;
  const list = result?.data?.list || [];
  if(total > 0 && list.length){
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${list
          .map((data, index) => {
            return `
              <url>
                <loc>${siteURL}tv-guide/asset/${data.assetId}/${data.scheduleId}/${createSlug(data.title)}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>1.0</priority>
              </url>
            `;
          })
          .join("")}
      </urlset>
  `;
  
   res.setHeader('Content-Type', 'text/xml');
   res.write(sitemap);
   res.end();
  
   return {
    props: {},
   };
  }
};

const createSlug = (label) =>{
  return label.replace(/[^a-zA-Z ]/g, "").replace(/([^\w]+|\s+)/g, '-');
}

export default Sitemap;