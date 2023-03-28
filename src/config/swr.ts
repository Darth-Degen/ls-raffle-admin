export const swrConfig = {
  fetcher: async (resource: any, init: any = {}) => {
    console.log(resource, init);
    try {
      const headers = {
        Authorization: `Bearer ${sessionStorage.getItem("wallet-token")}`,
        "Content-Type": "application/json",
      };

      // console.log('resource: ', resource);
      // console.log('init: ', init);

      const options = {
        headers,
        method: init.method,
        ...(init.payload && { body: JSON.stringify(init.payload) }),
      };

      const fullURL = process.env.NEXT_PUBLIC_API_BASE_URL + resource;
      return await fetch(fullURL, options).then((res) => {
        // console.log('res:', res);
        if (res.ok) {
          return res.json()
        } else {
          if (res.status >= 400 && res.status < 500) {
            // sessionStorage.removeItem("wallet-token");
            // window.location.reload();
            console.log('Error with token');
          }
          throw new Error(`HTTP error, status = ${res.status}`);
        }
      });
    } catch (e) {
      console.error('[SWR fetcher]: ', e);
    }
  }
}