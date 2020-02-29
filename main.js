const FEED = ".wikipedia.org/w/api.php?action=feedrecentchanges&hidebots=1&hidecategorization=1&hideWikibase=1&limit=50&days=7&urlversion=2&feedformat=atom&namespace=0&origin=*&utf8";

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

export { getFeed };
