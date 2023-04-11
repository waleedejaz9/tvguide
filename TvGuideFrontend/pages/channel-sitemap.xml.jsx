import AxiosHelper from "./../utils/helper/axios.helper";

const Sitemap = () =>{
 return null;
}


export const getServerSideProps = async ({res, params}) => {
  const siteURL = process.env.SITE_URL || 'localhost';
  const apiURL = `/channel/allList?offset=0&limit=100`;
  const request = new AxiosHelper(apiURL);
  const result = await request.get();
  const totalChannels = result?.data?.total || 0;

  if(totalChannels > 0){
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${result.data.list.map((data, index) => {
            return `
              <url>
              <loc>${siteURL}tv-guide/channel/${createSlug(data.title)}</loc>
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
  return label.replace(/[^\w\s]/gi, '').replace(/\s+/g, "-");
}

export default Sitemap;