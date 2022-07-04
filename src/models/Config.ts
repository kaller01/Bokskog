import { KeyJSONDB } from "./database";
import { readFileSync, writeFileSync } from "fs";

export const rssConfig = new KeyJSONDB(process.env.BOKSKOG_LOCAL + "rss.json", {
    "title": "Bokskog",
    "description": "Self hosted audiobook library.",
    "image": "https://photos.kallers.se/1080h/_MK23095.jpg",
    "lang": "en-us",
    "link": "https://new.kallers.se/"
});
rssConfig.load();

const rssDefaultTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <channel>
        <title>{{title}}</title>
        <description>{{description}} Served for {{user.name}}</description>
        <itunes:image href="{{image}}" />
        <language>{{lang}}</language>
        <link>{{link}}</link>
        <image>
            <link>{{link}}</link>
            <title>{{title}}</title>
            <url>{{image}}</url>
        </image>
        {{#audiobooks}}
        <item>
            <title>{{name}}</title>
            <enclosure url="{{url}}" length="{{length}}" />
            <itunes:duration>{{duration}}</itunes:duration>
            <guid>{{_id}}</guid>
        </item>
        {{/audiobooks}}
    </channel>
</rss>`;

export const getTemplateRss = (): string => {
    try {
        return readFileSync(process.env.BOKSKOG_LOCAL + "rss.mustache", 'utf8')
    } catch (error) {
        try {
            writeFileSync(String(process.env.BOKSKOG_LOCAL + "rss.mustache"), rssDefaultTemplate, 'utf8')
            return readFileSync(process.env.BOKSKOG_LOCAL + "rss.mustache", 'utf8')
        } catch (error) {
            return rssDefaultTemplate;
        }
    }
}

const data = getTemplateRss();
console.log(data);