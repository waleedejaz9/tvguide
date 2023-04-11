import AxiosHelper from "./../utils/helper/axios.helper";

const Sitemap = () =>{
 return null;
}

export const getServerSideProps = async ({ res }) => {
  const siteURL = process.env.SITE_URL || 'localhost';
  const request = new AxiosHelper( `/schedule/allList?offset=0&limit=1`);
  const result = await request.get();
  const total = result?.data?.total || 0;

  if(total > 0){
    const totalPages = total > 500 ? Math.ceil(total/500) : 1;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${
          Array(totalPages).fill(0).map((item, i)=>{
            return `
              <sitemap>
                <loc>${siteURL}tv-guide/program-sitemap/${i+1}.xml</loc>
              </sitemap>
            `;
          })
          .join("")}
      </sitemapindex>
    `;

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
    return {
      props: {},
     };
  }
};

export default Sitemap;