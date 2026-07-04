// get episodes from https://en.wikipedia.org/wiki/List_of_Bluey_episodes

function copyBlueyEpisodes(){
	navigator.clipboard.writeText(
		JSON.stringify(
		    Array.from(document.querySelectorAll('tr:has(td:nth-of-type(6))')).map(ep=>(
        {
          season:Number(ep.querySelector('th').textContent),
          episode:Number(ep.querySelector('td').textContent),
          title:ep.querySelector('td:nth-of-type(2)').textContent.replaceAll("\"","")
        }
      )),
			null, 4
		)
	)
}