const FEED = ".wikipedia.org/w/api.php?action=feedrecentchanges&hidebots=1&hidecategorization=1&hideWikibase=1&limit=50&days=7&urlversion=2&feedformat=atom&namespace=0&origin=*&utf8";
const GEO = ".wikipedia.org/w/api.php?action=query&format=json&origin=*&utf8&titles=";

const getFeed = async (lang,date=false) => {
  let getId = (url) => {
    try {
     url = url.split("&diff=")[1].split("&oldid")[0];
    } catch { console.log(url) }
    return url;
  }
  let feed = "https://"+lang+FEED
  feed += ((date !== false)?"&from="+date:"")
  feed = await fetch(feed);
  feed = new DOMParser().parseFromString((await feed.text()), "text/xml");
  feed = {
    contributions:[...feed.querySelectorAll("entry")]
      .map(e => ({
        title: e.querySelector("title").textContent,
        id: getId(e.querySelector("id").textContent)
    })),
    update:[...feed.querySelectorAll("updated")][0].innerHTML
  };
  return feed;
}

const getProperties = async (lang,titles,types) => {
  let properties = "https://"+lang+GEO+titles.join("|")+"&prop="+types.join("|");
  properties = await fetch(properties);
  properties = await properties.json();
  return Object.keys(properties.query.pages).map(id => {
    let output = { title:properties.query.pages[id].title };
    types.map(e => {
      if (Object.keys(properties.query.pages[id]).indexOf(e) >= 0) {
        output[e] = properties.query.pages[id][e];
      } else {
        output[e] = false;
      }
    });
    return output;
  });
};

const isGeo = async (lang,contributions) => {
  let geo = await getProperties(
    lang,
    contributions.map(e => e.title),
    ["mapdata","coordinates"]
  );
  return contributions.map(e => {
    try {
      e.geo = geo.find(g => g.title == e.title);
      if (e.geo.coordinates !== false) {
        e.geo = e.geo.coordinates[0];
      } else if (e.geo.mapdata !== false) {
        e.geo = JSON.parse(e.geo.mapdata[0]);
        e.geo = e.geo[Object.keys(e.geo)[0]][0].geometry.coordinates
        e.geo = {lat:e.geo[0],lon:e.geo[1]};
      } else {
        e.geo = false;
      }
    } catch(e) {
      console.warn("failed normalizing geodata...",e);
      e.geo = false;
    }
    return e;
  }).filter((e) => (e.geo !== false));
}

export { getFeed,isGeo };
