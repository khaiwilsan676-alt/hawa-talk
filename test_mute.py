import urllib.request
import urllib.parse

def search(query):
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        from html.parser import HTMLParser
        class MyHTMLParser(HTMLParser):
            def __init__(self):
                super().__init__()
                self.results = []
                self.in_result = False
                self.in_snippet = False
            def handle_starttag(self, tag, attrs):
                if tag == 'a':
                    for attr in attrs:
                        if attr[0] == 'class' and 'result__snippet' in attr[1]:
                            self.in_snippet = True
            def handle_endtag(self, tag):
                if tag == 'a' and self.in_snippet:
                    self.in_snippet = False
            def handle_data(self, data):
                if self.in_snippet:
                    self.results.append(data.strip())

        parser = MyHTMLParser()
        parser.feed(html)
        print("\n".join([r for r in parser.results if r]))
    except Exception as e:
        print(e)

search("jitsi external api executeCommand toggleAudio boolean argument")
