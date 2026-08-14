import urllib.request
import json
import urllib.parse

def search(query):
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        print(html[:2000])
    except Exception as e:
        print(e)

search("jitsi hear own voice echo external api")
