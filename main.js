const FEED = ".wikipedia.org/w/api.php?action=feedrecentchanges&hidebots=1&hidecategorization=1&hideWikibase=1&limit=50&days=7&urlversion=2&feedformat=atom&namespace=0&origin=*&utf8";
const GEO = ".wikipedia.org/w/api.php?action=query&format=json&origin=*&utf8&titles=";

const getFeed = async (lang,date=false) => {
  let getId = (url) => url.split("&diff=")[1].split("&oldid")[0];
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
let getProperties = async (lang,titles,types) => {
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

export { getFeed };
