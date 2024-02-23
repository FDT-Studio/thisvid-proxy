import { Router } from 'itty-router'

let router = Router()

const VideoRegex = /<a href="(https:\/\/thisvid.com\/videos\/[^"]+)" title="([^"]+)"[^>]*?>[\s\S]*?<span class="([^"]+)"[\s\S]*?(media.thisvid.com[^jpg]+)/g
const nowPageRegex = /<li class="active false"><span>(\d+)<\/span><\/li>/g
const lastPageRegex = /<li class="pagination-last"><a class="selective" href="[^"]*?(\d+)[^"]*?"/g
const videoUrlRegex = /video_url: '([^']+)'/g 

async function fetchHTMLInfo(url: string) {
	let response = await fetch(url)
	let body = await response.text()

	let matches
	let data = new Array()
	let nowPage, lastPage
	while ((matches = VideoRegex.exec(body)) !== null) {
		if (!matches[3].includes("private")) {
			data.push({
				href: matches[1],
				title: matches[2],
				//spanClass: matches[3],
				mediaLink: "https://" + matches[4] + "jpg"
			})
		}
	}

	if ((matches = nowPageRegex.exec(body)) !== null) {
		nowPage = matches[1]
	}

	if ((matches = lastPageRegex.exec(body)) !== null) {
		lastPage = matches[1]
	}

	return {
		videoData: data,
		nowPage: nowPage,
		lastPage: lastPage
	}
}

router.get('/contents/videos_screenshots/*', async function(request) {
	let url = new URL(request.url)
	url.hostname = "media.thisvid.com"
	url.protocol = "https"
	url.port = "443"

	let Req = new Request(url, request)

	return fetch(Req)
})

router.get("/videos/*", async function (request) {
	let url = new URL(request.url)
	url.hostname = "thisvid.com"
	url.protocol = "https"
	url.port = "443"

	let Req = new Request(url, request)
	let Resp = await fetch(Req)
	let body = await Resp.text()
	let matches
	let video_url

	if ((matches = videoUrlRegex.exec(body)) !== null) {
		video_url = matches[1]
	}

	if (video_url !== "" && video_url !== undefined) {
		let originUrl = new URL(a1({
			video_url: video_url,
			license_code: "$478310915780312"
		}, "function/", "code", "16px"))
		Req = new Request(originUrl, request)
		Resp = await fetch(Req)
		let Location = Resp.headers.get("Location")
		if (Resp.status === 302 && Location !== null && Location !== "") {
			url = new URL(Location)
			Req = new Request(url, request)
			Resp = await fetch(Req)
			Location = Resp.headers.get("Location")
			if (Resp.status === 302 && Location !== null && Location !== "") {
				return Response.json({
					videoUrl : Location
				})
			}
		}
	}

	return new Response("not found url", {status : 500})
})

router.get("/video_proxy", async function(request) {
	const url = new URL(request.url)

	const video_url = url.searchParams.get('url')
	if (video_url !== "" && video_url !== null) {
		const originUrl = new URL(atob(video_url))
		let Req = new Request(originUrl, request)
		return fetch(Req)
	} else {
		return new Response("not found url", {status : 500})
	}
})

router.get("/categories/:name/", async function(request) {
	let url = new URL(request.url)
	url.hostname = "thisvid.com"
	url.protocol = "https"
	url.port = "443"
	return Response.json(await fetchHTMLInfo(url.toString()))
})

router.get("/search", async function(request) {
	let url = new URL(request.url)
	url.hostname = "thisvid.com"
	url.protocol = "https"
	url.port = "443"
	return Response.json(await fetchHTMLInfo("https://thisvid.com/search?"))
})

router.get("/search", async function ({url}) {
	return Response.json(await fetchHTMLInfo("https://thisvid.com/search?q="+new URL(url).searchParams.get('query')))
})

router.get("/search/:id/", async function ({params, url}) {
	return Response.json(await fetchHTMLInfo("https://thisvid.com/search/"+params.id+"/?q="+new URL(url).searchParams.get('query')))
})

router.get("/", async function() {
	return Response.json(await fetchHTMLInfo("https://thisvid.com/latest-updates/1/"))
})

router.get("/:id/", async function({params}) {
	return Response.json(await fetchHTMLInfo("https://thisvid.com/latest-updates/"+params.id+"/"))
})


router.all('*', () => new Response('Not Found', { status: 404 }))

export default {
	async fetch(
		request: Request,
		//env: Env,
		//ctx: ExecutionContext
	): Promise<Response> {
		return router.handle(request)
	},
}


function a1(a, b, c, d) {
    for (var f in a)
        if (0 == a[f].indexOf(b)) {
            var g = a[f].substring(b.length).split(b[b.length - 1]);
            if (g[0] >= 0) {
                var h = g[6].substring(0, 2 * parseInt(d)),
                    i = a2(a, c, d);
                if (i && h) {
                    for (var j = h, k = h.length - 1; k >= 0; k--) {
                        for (var l = k, m = k; m < i.length; m++)
                            l += parseInt(i[m]);
                        for (; l >= h.length;)
                            l -= h.length;
                        for (var n = "", o = 0; o < h.length; o++)
                            n += o == k ? h[l] : o == l ? h[k] : h[o];
                        h = n
                    }
                    g[6] = g[6].replace(j, h),
                        g.splice(0, 1),
                        a[f] = g.join(b[b.length - 1])
                }
            }
        }
    return a.video_url
}

function a2(a, b, c) {
    var e, g, h, i, j, k, l, m, n, d = "",
        f = "",
        o = parseInt;
    for (e in a)
        if (e.indexOf(b) > 0 && a[e].length == o(c)) {
            d = a[e];
            break
        }
    if (d) {
        for (f = "",
            g = 1; g < d.length; g++)
            f += o(d[g]) ? o(d[g]) : 1;
        for (j = o(f.length / 2),
            k = o(f.substring(0, j + 1)),
            l = o(f.substring(j)),
            g = l - k,
            g < 0 && (g = -g),
            f = g,
            g = k - l,
            g < 0 && (g = -g),
            f += g,
            f *= 2,
            f = "" + f,
            i = o(c) / 2 + 2,
            m = "",
            g = 0; g < j + 1; g++)
            for (h = 1; h <= 4; h++)
                n = o(d[g + h]) + o(f[g]),
                n >= i && (n -= i),
                m += n;
        return m
    }
    return d
}